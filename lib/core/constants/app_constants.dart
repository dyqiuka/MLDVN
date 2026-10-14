import 'package:prj/features/auth/domain/models/user_model.dart';
import 'package:prj/features/home_service/domain/models/doctor_model.dart';
import 'package:prj/features/home_service/domain/models/service_model.dart';
import 'package:prj/features/profile_membership/domain/models/membership_model.dart';
import 'package:prj/features/treatment_care/domain/models/medical_record_model.dart';
import 'package:prj/features/vocational_training/domain/models/course_model.dart';

class AppConstants {
  static const String appName = 'MLD Wellness';
  static const String appVersion = '1.0.0';

  static final UserModel defaultPatientUser = UserModel(
    id: 'usr_patient_01',
    name: 'Nguyễn Thanh Tùng',
    email: 'thanhtung.nguyen@email.vn',
    phone: '0988 123 456',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: UserRole.patient,
    membershipTier: 'Gold',
    loyaltyPoints: 1850,
  );

  static final UserModel defaultStudentUser = UserModel(
    id: 'usr_student_02',
    name: 'Lê Hoàng Yến Nhi',
    email: 'yennhi.le@medilearn.edu.vn',
    phone: '0977 889 911',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    role: UserRole.student,
    membershipTier: 'Silver',
    loyaltyPoints: 920,
    studentId: 'MLD-K24-884',
    specialization: 'Kỹ thuật viên Spa',
  );

  static const List<DoctorModel> sampleDoctors = [
    DoctorModel(
      id: 'doc_01',
      name: 'Trần Minh Phương',
      title: 'Kỹ thuật viên massage',
      specialty: 'Massage trị liệu',
      hospital: 'MLD Wellness - Quận 3',
      rating: 4.9,
      reviewsCount: 384,
      yearsOfExperience: 6,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
      bio: 'Chuyên chăm sóc cơ thể, thư giãn toàn thân và phục hồi năng lượng.',
      consultationFee: 300000,
    ),
    DoctorModel(
      id: 'doc_02',
      name: 'Nguyễn Thu Hà',
      title: 'Chuyên viên chăm sóc da',
      specialty: 'Chăm sóc da',
      hospital: 'MLD Wellness - Quận 3',
      rating: 4.8,
      reviewsCount: 212,
      yearsOfExperience: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1594824813590-b18bb3901b0b?w=200',
      bio: 'Tập trung vào quy trình làm sạch dịu nhẹ, phục hồi độ ẩm và thư giãn.',
      consultationFee: 320000,
    ),
  ];

  static const List<ServiceModel> sampleServices = [
    ServiceModel(
      id: 'srv_01',
      name: 'Massage thư giãn toàn thân',
      category: 'Massage',
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600',
      price: 490000,
      originalPrice: 650000,
      durationMinutes: 60,
      rating: 4.95,
      reviewsCount: 820,
      isPopular: true,
      description: 'Liệu trình massage nhẹ nhàng giúp thả lỏng cơ thể trong không gian ấm áp và yên tĩnh.',
      highlights: [
        'Massage tinh dầu thảo mộc tự nhiên',
        'Ấn huyệt vùng lưng, vai và cổ',
        'Thưởng trà sau liệu trình',
      ],
      preparations: [
        'Đến trước lịch hẹn 10 phút',
        'Thông báo nếu có chấn thương hoặc đang mang thai',
      ],
      doctorIds: ['doc_01'],
    ),
    ServiceModel(
      id: 'srv_02',
      name: 'Chăm sóc da chuyên sâu',
      category: 'Chăm sóc da',
      imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
      price: 550000,
      originalPrice: 700000,
      durationMinutes: 75,
      rating: 4.9,
      reviewsCount: 650,
      isPopular: true,
      description: 'Làm sạch sâu, cấp ẩm và phục hồi làn da với quy trình chăm sóc dịu nhẹ.',
      highlights: [
        'Soi da và tư vấn nhanh',
        'Làm sạch sâu bã nhờn',
        'Đắp mặt nạ phục hồi',
      ],
      preparations: [
        'Hạn chế trang điểm đậm trước khi đến',
      ],
      doctorIds: ['doc_02'],
    ),
    ServiceModel(
      id: 'srv_03',
      name: 'Trị liệu cổ vai gáy ấn huyệt',
      category: 'Chăm sóc cơ thể',
      imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600',
      price: 380000,
      originalPrice: 500000,
      durationMinutes: 45,
      rating: 4.88,
      reviewsCount: 510,
      isPopular: true,
      description: 'Kỹ thuật xoa bóp và ấn huyệt giúp giảm căng cứng vùng cổ, vai, gáy.',
      highlights: [
        'Chườm thảo mộc nóng',
        'Ấn huyệt vùng vai gáy',
        'Kéo giãn cơ nhẹ nhàng',
      ],
      preparations: [
        'Mặc trang phục rộng rãi, thoải mái',
      ],
      doctorIds: ['doc_01'],
    ),
    ServiceModel(
      id: 'srv_04',
      name: 'Ngâm chân thảo dược & massage',
      category: 'Thư giãn',
      imageUrl: 'https://images.unsplash.com/photo-1519824145371-296894a0dc91?w=600',
      price: 320000,
      originalPrice: 420000,
      durationMinutes: 45,
      rating: 4.85,
      reviewsCount: 420,
      description: 'Ngâm chân thảo dược ấm kết hợp massage bấm huyệt lòng bàn chân.',
      highlights: [
        'Ngâm chân thảo dược',
        'Tẩy da chết gót chân',
        'Massage huyệt Dũng tuyền',
      ],
      preparations: [
        'Rửa sạch chân trước khi ngâm',
      ],
      doctorIds: ['doc_01'],
    ),
    ServiceModel(
      id: 'srv_05',
      name: 'Gói phục hồi năng lượng toàn diện VIP',
      category: 'Gói liệu trình',
      imageUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600',
      price: 890000,
      originalPrice: 1200000,
      durationMinutes: 90,
      rating: 4.98,
      reviewsCount: 930,
      isPopular: true,
      description: 'Liệu trình kết hợp xông hơi, massage đá nóng và chăm sóc da mặt cao cấp.',
      highlights: [
        'Xông hơi thư giãn',
        'Massage đá nóng',
        'Chăm sóc da mặt dưỡng ẩm',
      ],
      preparations: [
        'Không ăn quá no trước liệu trình 1 tiếng',
      ],
      doctorIds: ['doc_01', 'doc_02'],
    ),
  ];

  static final List<CourseModel> sampleCourses = [
    CourseModel(
      id: 'crs_spa_01',
      title: 'Kỹ thuật Massage Chuyên Nghiệp',
      category: 'Massage',
      instructorName: 'Nguyễn Thanh Hương',
      instructorTitle: 'Giảng viên kỹ thuật Spa',
      instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600',
      tuitionFee: 9000000,
      originalTuitionFee: 11000000,
      rating: 4.95,
      studentsCount: 380,
      totalLessons: 20,
      totalHours: 144,
      certificateTitle: 'Chứng chỉ Kỹ thuật viên Spa & Massage trị liệu',
      description: 'Chương trình thực hành chuyên nghiệp với quy trình chăm sóc khách hàng cao cấp.',
      isEnrolled: true,
      progress: 0.2,
      modules: const [
        CourseModuleModel(
          id: 'mod_spa_01',
          title: 'Chương 1: Giới thiệu nghề Spa',
          lessons: [
            LessonModel(
              id: 'les_spa_01',
              title: 'Bài 1: Tổng quan ngành Spa',
              durationMinutes: 12,
              videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
              isCompleted: true,
              summary: 'Xu hướng ngành spa và tiêu chuẩn phục vụ khách hàng.',
            ),
          ],
        ),
      ],
    ),
  ];

  static const List<QuizQuestionModel> sampleQuizQuestions = [
    QuizQuestionModel(
      id: 'q_01',
      question: 'Quy trình chăm sóc khách hàng nên bắt đầu bằng bước nào?',
      options: ['Tư vấn nhu cầu', 'Thu phí', 'Kết thúc dịch vụ', 'Bán thêm sản phẩm'],
      correctOptionIndex: 0,
      explanation: 'Tư vấn nhu cầu giúp chọn liệu trình phù hợp và an toàn.',
    ),
  ];

  static final List<MedicalRecordModel> sampleMedicalRecords = [
    MedicalRecordModel(
      id: 'emr_01',
      recordCode: 'EMR-2026-8819',
      examinationDate: DateTime.now().subtract(const Duration(days: 4)),
      doctorName: 'Trần Minh Phương',
      doctorTitle: 'Kỹ thuật viên massage',
      specialty: 'Massage trị liệu',
      diagnosis: 'Căng cơ vùng cổ vai gáy mức nhẹ',
      clinicHospital: 'MLD Wellness - Quận 3',
      symptomsReported: const ['Căng vai gáy', 'Mỏi lưng khi ngồi lâu'],
      labTestResults: const ['Không ghi nhận dấu hiệu bất thường'],
      treatmentRegimen: 'Massage thư giãn, kéo giãn nhẹ và nghỉ ngơi hợp lý.',
      followUpDate: DateTime.now().add(const Duration(days: 14)),
      status: 'Đang điều trị',
      prescriptions: const [
        PrescriptionItemModel(
          medicineName: 'Dầu thảo mộc thư giãn',
          dosage: 'Sử dụng ngoài da',
          frequency: 'Khi cần',
          days: 7,
          notes: 'Ngưng dùng nếu kích ứng da',
        ),
      ],
    ),
  ];

  static final List<VoucherModel> sampleVouchers = [
    VoucherModel(
      id: 'vch_01',
      code: 'MLD200',
      title: 'Giảm 200.000đ cho gói chăm sóc',
      description: 'Áp dụng cho dịch vụ spa và chăm sóc sức khỏe tại MLD.',
      discountAmount: 200000,
      minSpend: 1000000,
      expiryDate: DateTime.now().add(const Duration(days: 30)),
      category: 'Wellness',
    ),
  ];
}
