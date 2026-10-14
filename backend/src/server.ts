import express, { Request, Response } from 'express';
import cors from 'cors';
import { BookingStatus, EnrollmentStatus, Prisma, UserRole } from '@prisma/client';
import { database } from './data/database.js';
import { prisma } from './lib/prisma.js';

const app = express();
const PORT = process.env.PORT || 5000;
const asyncRoute = (handler: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: express.NextFunction) => Promise.resolve(handler(req, res)).catch(next);

app.use(cors());
app.use(express.json());

const serializeService = (service: any) => ({
  id: service.id,
  title: service.name,
  category: service.category,
  price: Number(service.price),
  originalPrice: service.originalPrice == null ? undefined : Number(service.originalPrice),
  durationMinutes: service.durationMinutes,
  rating: Number(service.rating),
  reviewsCount: service.reviewsCount,
  badge: service.badge ?? undefined,
  image: service.imageUrl ?? '',
  description: service.description ?? '',
  indicatorsCount: service.indicatorsCount,
  preparationNotes: service.preparationNotes,
});

const serializeSpecialist = (specialist: any) => ({
  id: specialist.id,
  name: specialist.name,
  title: specialist.title,
  specialty: specialist.specialty,
  hospital: specialist.workplace ?? specialist.branch?.name ?? '',
  experienceYears: specialist.experienceYears,
  rating: Number(specialist.rating),
  reviewsCount: specialist.reviewsCount,
  avatar: specialist.avatarUrl ?? '',
  consultationFee: Number(specialist.consultationFee),
  bio: specialist.bio ?? '',
});

const serializeVoucher = (item: any) => {
  const voucher = item.voucher ?? item;
  const status = item.usedAt ? 'used' : voucher.expiresAt < new Date() ? 'expired' : 'available';
  return {
    id: voucher.id,
    code: voucher.code,
    title: voucher.title,
    description: voucher.description,
    scope: voucher.scope.toLowerCase(),
    discountType: voucher.discountType.toLowerCase(),
    discountValue: voucher.discountValue,
    maxDiscountAmount: voucher.maxDiscountAmount,
    minOrderValue: voucher.minOrderValue,
    applicableCategories: voucher.applicableCategories,
    startsAt: voucher.startsAt.toISOString(),
    expiryDate: voucher.expiresAt.toISOString(),
    status,
  };
};

const serializeUser = (user: any) => ({
  id: user.id,
  name: user.name,
  phone: user.phone ?? '',
  email: user.email ?? '',
  role: user.role === UserRole.STUDENT ? 'student' : user.role === UserRole.ADMIN ? 'admin' : 'patient',
  avatar: user.avatarUrl ?? '',
  tier: user.tier,
  points: user.points,
  dob: user.dob ?? '',
  gender: user.gender ?? '',
  address: user.address ?? '',
  preferredBranch: user.preferredBranch ?? '',
  skinType: user.skinType ?? '',
  healthNotes: user.healthNotes ?? '',
  emergencyContactName: user.emergencyContactName ?? '',
  emergencyContactPhone: user.emergencyContactPhone ?? '',
});

const serializeCourse = (course: any) => ({
  id: course.id,
  title: course.title,
  category: course.category,
  price: Number(course.price),
  tuition: `${Number(course.price).toLocaleString('vi-VN')}đ`,
  depositAmount: Number(course.deposit),
  deposit: `${Number(course.deposit).toLocaleString('vi-VN')}đ`,
  duration: course.duration,
  instructor: course.instructor,
  image: course.imageUrl ?? '',
  description: course.description ?? '',
});

const serializeEnrollment = (enrollment: any) => ({
  id: enrollment.id,
  code: enrollment.code,
  courseId: enrollment.courseId,
  courseTitle: enrollment.course.title,
  courseImage: enrollment.course.imageUrl ?? '',
  studentName: enrollment.studentName,
  phone: enrollment.phone,
  email: enrollment.email ?? '',
  totalAmount: Number(enrollment.totalAmount),
  status: String(enrollment.status).toLowerCase(),
  createdAt: enrollment.createdAt.toISOString(),
});

const serializeNotification = (notification: any) => ({
  id: notification.id,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  entityId: notification.entityId,
  isRead: Boolean(notification.readAt),
  createdAt: notification.createdAt.toISOString(),
});

const parseBookingDate = (date: string, timeSlot: string) => {
  const [day, month, year] = date.split('/').map(Number);
  const [hour, minute] = timeSlot.split(' - ')[0].split(':').map(Number);
  if (![day, month, year, hour, minute].every(Number.isFinite)) return null;
  return new Date(Date.UTC(year, month - 1, day, hour - 7, minute));
};

const serializeBooking = (booking: any) => {
  const date = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(booking.scheduledAt);
  const start = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(booking.scheduledAt);
  const endDate = new Date(booking.scheduledAt.getTime() + booking.service.durationMinutes * 60_000);
  const end = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(endDate);
  const statusMap: Record<BookingStatus, string> = {
    PENDING: 'pending', CONFIRMED: 'confirmed', COMPLETED: 'completed', CANCELLED: 'cancelled',
  };
  return {
    id: booking.id,
    code: booking.code,
    userId: booking.userId,
    userName: booking.user.name,
    userPhone: booking.user.phone ?? '',
    serviceId: booking.serviceId,
    serviceTitle: booking.service.name,
    doctorId: booking.specialistId ?? '',
    doctorName: booking.specialist?.name ?? 'Trung tâm sắp xếp',
    branchId: booking.branchId,
    branchName: booking.branch.name,
    date,
    timeSlot: `${start} - ${end}`,
    price: Number(booking.service.price),
    discount: Math.max(0, Number(booking.service.price) - Number(booking.totalAmount)),
    finalPrice: Number(booking.totalAmount),
    paymentMethod: 'hospital',
    status: statusMap[booking.status as BookingStatus],
    notes: booking.notes ?? '',
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${booking.code}`,
    createdAt: booking.createdAt.toISOString(),
  };
};

const bookingInclude = { user: true, branch: true, service: true, specialist: true } as const;

const findBookingConflict = async (
  specialistId: string,
  scheduledAt: Date,
  durationMinutes: number,
  excludedBookingId?: string,
) => {
  const dayStart = new Date(scheduledAt);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
  const candidates = await prisma.booking.findMany({
    where: {
      specialistId,
      scheduledAt: { gte: dayStart, lt: dayEnd },
      status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      ...(excludedBookingId ? { id: { not: excludedBookingId } } : {}),
    },
    include: { service: true },
  });
  const requestedEnd = scheduledAt.getTime() + durationMinutes * 60_000;
  return candidates.find((candidate) => {
    const existingStart = candidate.scheduledAt.getTime();
    const existingEnd = existingStart + candidate.service.durationMinutes * 60_000;
    return scheduledAt.getTime() < existingEnd && requestedEnd > existingStart;
  });
};

// Request logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'MLD Vietnam - Cộng Đồng Dẫn Lưu Bạch Huyết & Đào Tạo Nghề API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 1. AUTH & USER ENDPOINTS (GROUP A)
// ==========================================
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Vui lòng cung cấp số điện thoại' });
  }

  // Demo OTP: 246800
  res.json({
    message: 'Mã xác thực OTP đã được gửi tới số điện thoại của bạn',
    phone,
    otpDemo: '246800',
    expiresInSeconds: 60,
  });
});

app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { phone, otp, role = 'patient' } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Vui lòng nhập số điện thoại và mã OTP' });
  }

  let user = database.users.find((u) => u.phone === phone);
  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      name: 'Nguyễn Minh Anh',
      phone,
      email: 'minh.anh@example.com',
      role: role as 'patient' | 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      tier: 'Gold',
      points: 2450,
      dob: '15/08/1998',
      gender: 'Nữ',
      address: '123 Đường Mẫu, Quận 3, TP. Hồ Chí Minh',
    };
    database.users.push(user);
  }

  res.json({
    message: 'Xác thực OTP thành công!',
    token: `jwt_token_${user.id}_${Date.now()}`,
    user,
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { phone, role = 'patient' } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Vui lòng cung cấp số điện thoại' });
  }

  let user = database.users.find((u) => u.phone === phone);
  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      name: role === 'student' ? 'Học Viên MLD' : 'Khách Hàng MLD',
      phone,
      email: `${phone}@mldvietnam.vn`,
      role: role as 'patient' | 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      tier: 'Gold',
      points: 2450,
      dob: '15/08/1998',
      gender: 'Nữ',
      address: '123 Đường Mẫu, Quận 3, TP. Hồ Chí Minh',
    };
    database.users.push(user);
  }

  res.json({
    message: 'Đăng nhập thành công',
    token: `jwt_token_${user.id}_${Date.now()}`,
    user,
  });
});

app.get('/api/auth/me', async (_req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: 'usr_001' } });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    res.json({ user: serializeUser(user) });
  } catch (error) {
    console.error('[API] GET /auth/me failed', error);
    res.status(500).json({ error: 'Không thể tải hồ sơ người dùng' });
  }
});

app.put('/api/auth/profile', async (req: Request, res: Response) => {
  const {
    name, email, address, dob, gender, avatar, preferredBranch, skinType,
    healthNotes, emergencyContactName, emergencyContactPhone,
  } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Họ và tên không được để trống' });
  try {
    const user = await prisma.user.update({
      where: { id: 'usr_001' },
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        address: address?.trim() || null,
        dob: dob?.trim() || null,
        gender: gender || null,
        avatarUrl: avatar || null,
        preferredBranch: preferredBranch || null,
        skinType: skinType || null,
        healthNotes: healthNotes || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
      },
    });
    res.json({ message: 'Cập nhật thông tin thành công', user: serializeUser(user) });
  } catch (error) {
    console.error('[API] PUT /auth/profile failed', error);
    res.status(500).json({ error: 'Không thể cập nhật hồ sơ' });
  }
});

// ==========================================
// 2. SERVICES & SPECIALISTS ENDPOINTS (GROUP B)
// ==========================================
app.get('/api/services', async (req: Request, res: Response) => {
  const { category, search } = req.query;
  try {
    const result = await prisma.service.findMany({
      where: {
        isActive: true,
        ...(category && category !== 'all' ? { category: { contains: String(category), mode: 'insensitive' } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ total: result.length, services: result.map(serializeService) });
  } catch (error) {
    console.error('[API] GET /services failed', error);
    res.status(500).json({ error: 'Không thể tải danh sách dịch vụ' });
  }
});

app.get('/api/services/:id', async (req: Request, res: Response) => {
  try {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) return res.status(404).json({ error: 'Không tìm thấy dịch vụ' });
    res.json({ service: serializeService(service) });
  } catch (error) {
    console.error('[API] GET /services/:id failed', error);
    res.status(500).json({ error: 'Không thể tải dịch vụ' });
  }
});

app.get('/api/doctors', async (_req: Request, res: Response) => {
  try {
    const specialists = await prisma.specialist.findMany({ where: { isActive: true }, include: { branch: true } });
    res.json({ total: specialists.length, doctors: specialists.map(serializeSpecialist) });
  } catch (error) {
    console.error('[API] GET /doctors failed', error);
    res.status(500).json({ error: 'Không thể tải danh sách chuyên viên' });
  }
});

app.get('/api/doctors/:id', async (req: Request, res: Response) => {
  try {
    const specialist = await prisma.specialist.findUnique({ where: { id: req.params.id }, include: { branch: true } });
    if (!specialist) return res.status(404).json({ error: 'Không tìm thấy kỹ thuật viên/chuyên viên' });
    res.json({ doctor: serializeSpecialist(specialist) });
  } catch (error) {
    console.error('[API] GET /doctors/:id failed', error);
    res.status(500).json({ error: 'Không thể tải chuyên viên' });
  }
});

app.get('/api/branches', async (_req: Request, res: Response) => {
  try {
    const branches = await prisma.branch.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } });
    res.json({ branches });
  } catch (error) {
    console.error('[API] GET /branches failed', error);
    res.status(500).json({ error: 'Không thể tải danh sách chi nhánh' });
  }
});

// ==========================================
// 3. BOOKINGS & PAYMENTS (GROUP C)
// ==========================================
app.get('/api/bookings', async (_req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({ include: bookingInclude, orderBy: { scheduledAt: 'desc' } });
    res.json({ total: bookings.length, bookings: bookings.map(serializeBooking) });
  } catch (error) {
    console.error('[API] GET /bookings failed', error);
    res.status(500).json({ error: 'Không thể tải lịch hẹn' });
  }
});

app.get('/api/bookings/:id', async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: { OR: [{ id: req.params.id }, { code: req.params.id }] },
      include: bookingInclude,
    });
    if (!booking) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
    res.json({ booking: serializeBooking(booking) });
  } catch (error) {
    console.error('[API] GET /bookings/:id failed', error);
    res.status(500).json({ error: 'Không thể tải lịch hẹn' });
  }
});

app.post('/api/bookings', async (req: Request, res: Response) => {
  const {
    serviceId,
    doctorId,
    branchId,
    date,
    timeSlot,
    userName,
    userPhone,
    notes = '',
    voucherCode,
  } = req.body;
  const scheduledAt = parseBookingDate(date, timeSlot);
  if (!serviceId || !branchId || !date || !timeSlot || !scheduledAt) {
    return res.status(400).json({ error: 'Thông tin đặt lịch chưa đầy đủ hoặc không hợp lệ' });
  }

  try {
    const [service, branch, requestedSpecialist] = await Promise.all([
      prisma.service.findUnique({ where: { id: serviceId } }),
      prisma.branch.findUnique({ where: { id: branchId } }),
      doctorId ? prisma.specialist.findUnique({ where: { id: doctorId } }) : Promise.resolve(null),
    ]);
    if (!service || !branch) return res.status(404).json({ error: 'Dịch vụ hoặc chi nhánh không tồn tại' });
    if (doctorId && !requestedSpecialist) return res.status(404).json({ error: 'Chuyên viên không tồn tại' });
    if (scheduledAt.getTime() <= Date.now()) return res.status(400).json({ error: 'Vui lòng chọn thời gian trong tương lai' });
    if (requestedSpecialist && requestedSpecialist.branchId !== branchId) {
      return res.status(409).json({ error: 'Chuyên viên không làm việc tại chi nhánh đã chọn' });
    }

    let appliedUserVoucher: any = null;
    let finalAmount = Number(service.price);
    if (voucherCode) {
      appliedUserVoucher = await prisma.userVoucher.findFirst({
        where: { userId: 'usr_001', usedAt: null, voucher: { code: String(voucherCode).trim().toUpperCase() } },
        include: { voucher: true },
      });
      const voucher = appliedUserVoucher?.voucher;
      const now = new Date();
      if (!voucher || !voucher.isActive || voucher.startsAt > now || voucher.expiresAt < now) {
        return res.status(400).json({ error: 'Mã ưu đãi không khả dụng hoặc đã hết hạn' });
      }
      if (voucher.scope !== 'ALL' && voucher.scope !== 'SERVICE') {
        return res.status(400).json({ error: 'Mã này chỉ áp dụng cho khóa học' });
      }
      if (voucher.applicableCategories.length && !voucher.applicableCategories.includes(service.category)) {
        return res.status(400).json({ error: `Mã chỉ áp dụng cho: ${voucher.applicableCategories.join(', ')}` });
      }
      if (finalAmount < voucher.minOrderValue) {
        return res.status(400).json({ error: `Giá trị dịch vụ tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')} đ` });
      }
      const calculated = voucher.discountType === 'PERCENT'
        ? Math.floor(finalAmount * voucher.discountValue / 100)
        : voucher.discountValue;
      finalAmount -= Math.min(calculated, voucher.maxDiscountAmount ?? calculated, finalAmount);
    }

    let assignedSpecialist = requestedSpecialist;
    if (!assignedSpecialist) {
      const available = await prisma.specialist.findMany({
        where: { branchId, isActive: true, services: { some: { serviceId } } },
      });
      for (const candidate of available) {
        const conflict = await findBookingConflict(candidate.id, scheduledAt, service.durationMinutes);
        if (!conflict) {
          assignedSpecialist = candidate;
          break;
        }
      }
      if (!assignedSpecialist) {
        return res.status(409).json({ error: 'Tất cả chuyên viên đã kín lịch ở khung giờ này. Vui lòng chọn giờ khác.' });
      }
    }

    const conflict = await findBookingConflict(assignedSpecialist.id, scheduledAt, service.durationMinutes);
    if (conflict) {
      return res.status(409).json({
        error: `${assignedSpecialist.name} đã có lịch trùng thời gian này. Vui lòng chọn chuyên viên hoặc giờ khác.`,
        code: 'BOOKING_CONFLICT',
      });
    }

    const user = await prisma.user.update({
      where: { id: 'usr_001' },
      data: {
        ...(userName ? { name: userName } : {}),
        ...(userPhone ? { phone: String(userPhone).replace(/\s/g, '') } : {}),
      },
    });
    const code = `SPA-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const created = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          code,
          userId: user.id,
          branchId,
          serviceId,
          specialistId: assignedSpecialist!.id,
          scheduledAt,
          status: BookingStatus.CONFIRMED,
          notes,
          totalAmount: finalAmount,
        },
        include: bookingInclude,
      });
      await tx.notification.create({
        data: {
          userId: user.id,
          type: 'booking',
          entityId: booking.id,
          title: 'Đặt lịch thành công',
          message: `${service.name} lúc ${timeSlot}, ngày ${date} tại ${branch.name}.`,
        },
      });
      if (appliedUserVoucher) {
        await tx.userVoucher.update({
          where: { userId_voucherId: { userId: user.id, voucherId: appliedUserVoucher.voucherId } },
          data: { usedAt: new Date() },
        });
        await tx.voucher.update({ where: { id: appliedUserVoucher.voucherId }, data: { usageCount: { increment: 1 } } });
      }
      return booking;
    });
    res.status(201).json({ message: 'Đặt lịch thành công', booking: serializeBooking(created) });
  } catch (error) {
    console.error('[API] POST /bookings failed', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'Khung giờ này vừa được người khác đặt. Vui lòng chọn giờ khác.', code: 'BOOKING_CONFLICT' });
    }
    res.status(500).json({ error: 'Không thể tạo lịch hẹn' });
  }
});

app.patch('/api/bookings/:id/reschedule', async (req: Request, res: Response) => {
  const { date, timeSlot } = req.body;
  const scheduledAt = parseBookingDate(date, timeSlot);
  if (!scheduledAt) return res.status(400).json({ error: 'Ngày hoặc giờ hẹn không hợp lệ' });
  try {
    const current = await prisma.booking.findUnique({ where: { id: req.params.id }, include: { service: true } });
    if (!current) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
    if (current.status === BookingStatus.CANCELLED || current.status === BookingStatus.COMPLETED) {
      return res.status(409).json({ error: 'Không thể đổi lịch đã hủy hoặc đã hoàn thành' });
    }
    if (scheduledAt.getTime() <= Date.now()) return res.status(400).json({ error: 'Vui lòng chọn thời gian trong tương lai' });
    const conflict = current.specialistId
      ? await findBookingConflict(current.specialistId, scheduledAt, current.service.durationMinutes, current.id)
      : null;
    if (conflict) return res.status(409).json({ error: 'Chuyên viên đã có lịch trùng thời gian mới. Vui lòng chọn giờ khác.', code: 'BOOKING_CONFLICT' });
    const updated = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id: current.id }, data: { scheduledAt }, include: bookingInclude,
      });
      await tx.notification.create({
        data: { userId: current.userId, type: 'booking', entityId: current.id, title: 'Lịch hẹn đã được thay đổi', message: `Lịch mới: ${timeSlot}, ngày ${date}.` },
      });
      return booking;
    });
    res.json({ message: 'Đổi lịch thành công', booking: serializeBooking(updated) });
  } catch (error) {
    console.error('[API] PATCH /bookings/:id/reschedule failed', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'Khung giờ mới vừa được người khác đặt. Vui lòng chọn giờ khác.', code: 'BOOKING_CONFLICT' });
    }
    res.status(500).json({ error: 'Không thể đổi lịch hẹn' });
  }
});

app.patch('/api/bookings/:id/cancel', async (req: Request, res: Response) => {
  try {
    const current = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
    if (current.status === BookingStatus.COMPLETED) return res.status(409).json({ error: 'Không thể hủy lịch đã hoàn thành' });
    if (current.status === BookingStatus.CANCELLED) return res.status(409).json({ error: 'Lịch hẹn này đã được hủy trước đó' });
    const updated = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id: current.id },
        data: { status: BookingStatus.CANCELLED, notes: req.body.reason || current.notes },
        include: bookingInclude,
      });
      await tx.notification.create({
        data: { userId: current.userId, type: 'booking', entityId: current.id, title: 'Lịch hẹn đã hủy', message: `Mã lịch ${current.code} đã được hủy theo yêu cầu của bạn.` },
      });
      return booking;
    });
    res.json({ message: 'Hủy lịch thành công', booking: serializeBooking(updated) });
  } catch (error) {
    console.error('[API] PATCH /bookings/:id/cancel failed', error);
    res.status(500).json({ error: 'Không thể hủy lịch hẹn' });
  }
});

// ==========================================
// 4. ACADEMY & COURSES ENDPOINTS (GROUP E)
// ==========================================
app.get('/api/courses', async (_req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } });
    res.json({ total: courses.length, courses: courses.map(serializeCourse) });
  } catch (error) {
    console.error('[API] GET /courses failed', error);
    res.status(500).json({ error: 'Không thể tải danh sách khóa học' });
  }
});

app.get('/api/courses/:id', async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) return res.status(404).json({ error: 'Không tìm thấy khóa học' });
    res.json({ course: serializeCourse(course) });
  } catch (error) {
    console.error('[API] GET /courses/:id failed', error);
    res.status(500).json({ error: 'Không thể tải khóa học' });
  }
});

app.get('/api/course-enrollments', async (_req: Request, res: Response) => {
  try {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId: 'usr_001' }, include: { course: true }, orderBy: { createdAt: 'desc' },
    });
    res.json({ enrollments: enrollments.map(serializeEnrollment) });
  } catch (error) {
    console.error('[API] GET /course-enrollments failed', error);
    res.status(500).json({ error: 'Không thể tải khóa học đã đăng ký' });
  }
});

app.post('/api/course-enrollments', async (req: Request, res: Response) => {
  const { courseId, studentName, phone, email, voucherCode } = req.body;
  if (!courseId || !studentName?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ họ tên và số điện thoại học viên' });
  }
  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || !course.isActive) return res.status(404).json({ error: 'Khóa học không tồn tại hoặc đã ngừng tuyển sinh' });
    const existing = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId: 'usr_001', courseId } }, include: { course: true },
    });
    if (existing && existing.status !== EnrollmentStatus.CANCELLED) {
      return res.status(409).json({ error: 'Bạn đã đăng ký khóa học này', enrollment: serializeEnrollment(existing) });
    }
    let appliedUserVoucher: any = null;
    let finalAmount = Number(course.price);
    if (voucherCode) {
      appliedUserVoucher = await prisma.userVoucher.findFirst({
        where: { userId: 'usr_001', usedAt: null, voucher: { code: String(voucherCode).trim().toUpperCase() } },
        include: { voucher: true },
      });
      const voucher = appliedUserVoucher?.voucher;
      const now = new Date();
      if (!voucher || !voucher.isActive || voucher.startsAt > now || voucher.expiresAt < now) {
        return res.status(400).json({ error: 'Mã ưu đãi không khả dụng hoặc đã hết hạn' });
      }
      if (voucher.scope !== 'ALL' && voucher.scope !== 'COURSE') {
        return res.status(400).json({ error: 'Mã này chỉ áp dụng cho dịch vụ chăm sóc' });
      }
      if (finalAmount < voucher.minOrderValue) {
        return res.status(400).json({ error: `Học phí tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')} đ` });
      }
      const calculated = voucher.discountType === 'PERCENT' ? Math.floor(finalAmount * voucher.discountValue / 100) : voucher.discountValue;
      finalAmount -= Math.min(calculated, voucher.maxDiscountAmount ?? calculated, finalAmount);
    }
    const code = `MLD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const enrollment = await prisma.$transaction(async (tx) => {
      const saved = existing
        ? await tx.courseEnrollment.update({
            where: { id: existing.id },
            data: { code, studentName: studentName.trim(), phone: phone.trim(), email: email?.trim() || null, status: EnrollmentStatus.PENDING, totalAmount: finalAmount },
            include: { course: true },
          })
        : await tx.courseEnrollment.create({
            data: { code, userId: 'usr_001', courseId, studentName: studentName.trim(), phone: phone.trim(), email: email?.trim() || null, totalAmount: finalAmount },
            include: { course: true },
          });
      await tx.notification.create({
        data: { userId: 'usr_001', type: 'course', entityId: saved.id, title: 'Đăng ký khóa học thành công', message: `${course.title} đã được giữ chỗ. Bộ phận đào tạo sẽ liên hệ xác nhận học phí.` },
      });
      if (appliedUserVoucher) {
        await tx.userVoucher.update({
          where: { userId_voucherId: { userId: 'usr_001', voucherId: appliedUserVoucher.voucherId } },
          data: { usedAt: new Date() },
        });
        await tx.voucher.update({ where: { id: appliedUserVoucher.voucherId }, data: { usageCount: { increment: 1 } } });
      }
      return saved;
    });
    res.status(201).json({ message: 'Đăng ký khóa học thành công', enrollment: serializeEnrollment(enrollment) });
  } catch (error) {
    console.error('[API] POST /course-enrollments failed', error);
    res.status(500).json({ error: 'Không thể đăng ký khóa học' });
  }
});

app.post('/api/courses/:id/quiz/submit', (req: Request, res: Response) => {
  const { answers } = req.body;
  const course = database.courses.find((c) => c.id === req.params.id);

  if (!course || !course.quiz) {
    return res.status(404).json({ error: 'Khóa học không có bài kiểm tra trắc nghiệm' });
  }

  let correctCount = 0;
  course.quiz.questions.forEach((q) => {
    if (answers && answers[q.id] === q.correctAnswerIndex) {
      correctCount++;
    }
  });

  const total = course.quiz.questions.length;
  const scorePercent = Math.round((correctCount / total) * 100);
  const isPassed = scorePercent >= course.quiz.passingScore;

  res.json({
    score: scorePercent,
    correctCount,
    totalQuestions: total,
    isPassed,
    certificateCode: isPassed ? `CERT-${course.id.toUpperCase()}-${Date.now().toString().slice(-6)}` : null,
    message: isPassed
      ? `Chúc mừng bạn đã xuất sắc vượt qua bài thi với ${scorePercent}%! Chứng chỉ MLD Academy đã được cấp.`
      : `Bạn đạt ${scorePercent}%. Cần đạt tối thiểu ${course.quiz.passingScore}% để nhận chứng chỉ. Vui lòng ôn tập và thi lại.`,
  });
});

// ==========================================
// 5. MEDICAL RECORDS & EMR (GROUP D)
// ==========================================
app.get('/api/records', (req: Request, res: Response) => {
  res.json({ total: database.medicalRecords.length, records: database.medicalRecords });
});

app.get('/api/records/:id', (req: Request, res: Response) => {
  const record = database.medicalRecords.find((r) => r.id === req.params.id || r.recordCode === req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ trị liệu' });
  }
  res.json({ record });
});

// ==========================================
// 6. MEMBERSHIP & VOUCHERS (GROUP F)
// ==========================================
app.get('/api/membership', async (_req: Request, res: Response) => {
  try {
    const [user, userVouchers] = await Promise.all([
      prisma.user.findUnique({ where: { id: 'usr_001' } }),
      prisma.userVoucher.findMany({
        where: { userId: 'usr_001', voucher: { isActive: true } },
        include: { voucher: true },
        orderBy: { claimedAt: 'desc' },
      }),
    ]);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy hội viên' });
    res.json({ user: { ...serializeUser(user), nextTierPoints: 5000 }, vouchers: userVouchers.map(serializeVoucher) });
  } catch (error) {
    console.error('[API] GET /membership failed', error);
    res.status(500).json({ error: 'Không thể tải thông tin hội viên' });
  }
});

app.get('/api/notifications', async (_req: Request, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({ where: { userId: 'usr_001' }, orderBy: { createdAt: 'desc' }, take: 50 });
    res.json({ unreadCount: notifications.filter((item) => !item.readAt).length, notifications: notifications.map(serializeNotification) });
  } catch (error) {
    console.error('[API] GET /notifications failed', error);
    res.status(500).json({ error: 'Không thể tải thông báo' });
  }
});

app.patch('/api/notifications/read-all', async (_req: Request, res: Response) => {
  try {
    await prisma.notification.updateMany({ where: { userId: 'usr_001', readAt: null }, data: { readAt: new Date() } });
    res.json({ message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể cập nhật thông báo' });
  }
});

app.patch('/api/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const notification = await prisma.notification.findFirst({ where: { id: req.params.id, userId: 'usr_001' } });
    if (!notification) return res.status(404).json({ error: 'Không tìm thấy thông báo' });
    const updated = await prisma.notification.update({ where: { id: notification.id }, data: { readAt: new Date() } });
    res.json({ notification: serializeNotification(updated) });
  } catch (error) {
    res.status(500).json({ error: 'Không thể cập nhật thông báo' });
  }
});

app.post('/api/vouchers/claim', asyncRoute(async (req: Request, res: Response) => {
  const code = String(req.body.code ?? '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'Vui lòng nhập mã ưu đãi' });
  const voucher = await prisma.voucher.findUnique({ where: { code } });
  const now = new Date();
  if (!voucher || !voucher.isActive || voucher.startsAt > now || voucher.expiresAt < now) {
    return res.status(404).json({ error: 'Mã ưu đãi không tồn tại hoặc đã hết hạn' });
  }
  const existing = await prisma.userVoucher.findUnique({
    where: { userId_voucherId: { userId: 'usr_001', voucherId: voucher.id } },
  });
  if (existing) return res.status(409).json({ error: 'Mã ưu đãi đã có trong ví của bạn' });
  const claimed = await prisma.userVoucher.create({
    data: { userId: 'usr_001', voucherId: voucher.id }, include: { voucher: true },
  });
  res.status(201).json({ voucher: serializeVoucher(claimed), message: `Đã thêm ${code} vào ví ưu đãi` });
}));

app.post('/api/vouchers/apply', asyncRoute(async (req: Request, res: Response) => {
  const { code, orderValue, scope, category } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Vui lòng nhập mã giảm giá' });
  }
  const userVoucher = await prisma.userVoucher.findFirst({
    where: { userId: 'usr_001', usedAt: null, voucher: { code: String(code).trim().toUpperCase() } },
    include: { voucher: true },
  });
  const voucher = userVoucher?.voucher;
  const now = new Date();
  if (!voucher || !voucher.isActive || voucher.startsAt > now || voucher.expiresAt < now) {
    return res.status(404).json({ error: 'Mã giảm giá không khả dụng hoặc đã hết hạn' });
  }
  const normalizedScope = String(scope ?? '').toUpperCase();
  if (voucher.scope !== 'ALL' && voucher.scope !== normalizedScope) {
    return res.status(400).json({ error: `Mã này chỉ áp dụng cho ${voucher.scope === 'COURSE' ? 'khóa học' : 'dịch vụ chăm sóc'}` });
  }
  if (voucher.applicableCategories.length && !voucher.applicableCategories.includes(String(category ?? ''))) {
    return res.status(400).json({ error: `Mã chỉ áp dụng cho: ${voucher.applicableCategories.join(', ')}` });
  }
  const amount = Number(orderValue);
  if (!Number.isFinite(amount) || amount < voucher.minOrderValue) {
    return res.status(400).json({
      error: `Giá trị tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')} đ để dùng mã này`,
    });
  }
  const calculated = voucher.discountType === 'PERCENT' ? Math.floor(amount * voucher.discountValue / 100) : voucher.discountValue;
  const discountAmount = Math.min(calculated, voucher.maxDiscountAmount ?? calculated, amount);
  res.json({
    valid: true,
    code: voucher.code,
    title: voucher.title,
    scope: voucher.scope.toLowerCase(),
    discountAmount,
    finalAmount: amount - discountAmount,
    message: `Đã áp dụng ${voucher.code}, giảm ${discountAmount.toLocaleString('vi-VN')} đ`,
  });
}));

// ==========================================
// 7. WEB ADMIN PORTAL ENDPOINTS (GROUP W)
// ==========================================
app.get('/api/admin/overview', (req: Request, res: Response) => {
  res.json({
    kpis: database.admin.kpis,
    weeklyRevenue: database.admin.weeklyRevenue,
    bookingsCount: database.bookings.length,
    studentsCount: database.admin.students.length,
  });
});

app.get('/api/admin/schedule', (req: Request, res: Response) => {
  res.json({
    schedules: database.admin.staffSchedules,
  });
});

app.get('/api/admin/receipts', (req: Request, res: Response) => {
  res.json({
    receipts: database.admin.posReceipts,
  });
});

app.post('/api/admin/receipts', (req: Request, res: Response) => {
  const { customerName, serviceTitle, techName, amount, discount = 0, paymentMethod = 'Tiền mặt' } = req.body;
  const newReceipt = {
    receiptCode: `HD-2026-${Math.floor(100 + Math.random() * 900)}`,
    customerName: customerName || 'Khách Vãng Lai',
    serviceTitle: serviceTitle || 'Massage thư giãn toàn thân',
    techName: techName || 'Trần Minh Phương',
    room: 'Phòng 01 - Quận 3',
    amount: Number(amount) || 450000,
    discount: Number(discount) || 0,
    finalAmount: Math.max(0, (Number(amount) || 450000) - (Number(discount) || 0)),
    paymentMethod,
    status: 'Đã thanh toán',
    time: new Date().toLocaleString('vi-VN'),
  };

  database.admin.posReceipts.unshift(newReceipt);
  database.admin.kpis.todayRevenue += newReceipt.finalAmount;

  res.status(201).json({
    message: 'Tạo phiếu thu thành công!',
    receipt: newReceipt,
  });
});

app.get('/api/admin/students', (req: Request, res: Response) => {
  res.json({
    students: database.admin.students,
  });
});

app.get('/api/admin/bootstrap', async (_req: Request, res: Response) => {
  try {
    const [branches, users, services, specialists, bookings, courses, enrollments, notifications] = await Promise.all([
      prisma.branch.findMany({ include: { services: { include: { service: true } }, staff: true }, orderBy: { createdAt: 'asc' } }),
      prisma.user.findMany({ include: { bookings: true, enrollments: true }, orderBy: { createdAt: 'desc' } }),
      prisma.service.findMany({ include: { branches: true, specialists: true }, orderBy: { createdAt: 'asc' } }),
      prisma.specialist.findMany({ include: { branch: true, services: true, schedules: true }, orderBy: { name: 'asc' } }),
      prisma.booking.findMany({ include: bookingInclude, orderBy: { scheduledAt: 'desc' } }),
      prisma.course.findMany({ include: { enrollments: true }, orderBy: { createdAt: 'asc' } }),
      prisma.courseEnrollment.findMany({ include: { course: true, user: true }, orderBy: { createdAt: 'desc' } }),
      prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    ]);
    res.json({
      generatedAt: new Date().toISOString(),
      branches: branches.map((branch) => ({ ...branch, services: branch.services.map((item) => item.service) })),
      users: users.map((user) => ({ ...user, avatar: user.avatarUrl || '' })),
      services: services.map((service) => ({ ...service, price: Number(service.price), originalPrice: service.originalPrice ? Number(service.originalPrice) : null, rating: Number(service.rating) })),
      specialists: specialists.map((specialist) => ({ ...specialist, rating: Number(specialist.rating), consultationFee: Number(specialist.consultationFee) })),
      bookings: bookings.map(serializeBooking),
      courses: courses.map((course) => ({ ...course, price: Number(course.price), deposit: Number(course.deposit) })),
      enrollments: enrollments.map(serializeEnrollment),
      notifications,
    });
  } catch (error) {
    console.error('[API] GET /admin/bootstrap failed', error);
    res.status(500).json({ error: 'Không thể tải dữ liệu quản trị' });
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error('[API] Unhandled request error', error);
  if (!res.headersSent) res.status(500).json({ error: 'Hệ thống đang bận. Vui lòng thử lại sau.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 [BACKEND] MLD Vietnam Healthcare & Academy Server running at http://localhost:${PORT}`);
  console.log(`📚 [API DOCS] Endpoints available at:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - POST /api/auth/send-otp`);
  console.log(`   - POST /api/auth/verify-otp`);
  console.log(`   - GET  /api/services`);
  console.log(`   - GET  /api/doctors`);
  console.log(`   - POST /api/bookings`);
  console.log(`   - GET  /api/courses`);
  console.log(`   - GET  /api/records`);
  console.log(`   - GET  /api/membership`);
  console.log(`   - GET  /api/admin/overview`);
  console.log(`   - GET  /api/admin/schedule`);
  console.log(`   - GET  /api/admin/receipts`);
  console.log(`   - GET  /api/admin/students`);
});
