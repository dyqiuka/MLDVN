import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:prj/core/constants/app_constants.dart';
import 'package:prj/core/theme/app_colors.dart';
import 'package:prj/core/theme/app_typography.dart';
import 'package:prj/core/widgets/branch_card.dart';
import 'package:prj/core/widgets/category_chips.dart';
import 'package:prj/core/widgets/course_card.dart';
import 'package:prj/core/widgets/service_card.dart';
import 'package:prj/core/widgets/specialist_card.dart';
import 'package:prj/core/widgets/welcome_banner_card.dart';
import 'package:prj/features/auth/presentation/controllers/auth_controller.dart';
import 'package:prj/features/booking_payment/presentation/controllers/booking_controller.dart';
import 'package:prj/features/booking_payment/presentation/screens/booking_flow_screen.dart';
import 'package:prj/features/home_service/presentation/controllers/home_controller.dart';
import 'package:prj/features/notifications/presentation/screens/notifications_screen.dart';
import 'package:prj/features/vocational_training/presentation/controllers/course_controller.dart';
import 'package:prj/features/vocational_training/presentation/screens/course_detail_screen.dart';
import 'search_discovery_screen.dart';
import 'service_detail_screen.dart';

class HomeDashboardScreen extends StatefulWidget {
  final ValueChanged<int> onNavigateTab;

  const HomeDashboardScreen({super.key, required this.onNavigateTab});

  @override
  State<HomeDashboardScreen> createState() => _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends State<HomeDashboardScreen> {
  int _selectedCategoryIndex = 0;
  String _selectedBranch = 'Chi nhánh mẫu 01 - Quận 3';

  static const _branches = [
    BranchModel(
      id: 'br_01',
      name: 'Chi nhánh mẫu 01 - Quận 3',
      address: '123 Đường Mẫu, Phường Mẫu, TP. Hồ Chí Minh',
      openingHours: '09:00 - 20:00 · Cả tuần',
      imageUrl:
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
    ),
    BranchModel(
      id: 'br_02',
      name: 'Chi nhánh mẫu 02 - Cầu Giấy',
      address: '45 Đường Mẫu, Phường Mẫu, Cầu Giấy, Hà Nội',
      openingHours: '09:00 - 20:00 · Cả tuần',
      imageUrl:
          'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&auto=format&fit=crop&q=80',
    ),
  ];

  static const _specialists = [
    SpecialistCard(
      name: 'Trần Minh Phương',
      title: 'Kỹ thuật viên massage',
      specialtyDescription: 'Chăm sóc cơ thể · Thư giãn toàn thân',
      avatarUrl:
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewsCount: 38,
      yearsOfExperience: 4,
      isHorizontal: true,
      width: 176,
      margin: EdgeInsets.only(right: 12),
    ),
    SpecialistCard(
      name: 'Nguyễn Thu Hà',
      title: 'Chuyên viên chăm sóc da',
      specialtyDescription: 'Chăm sóc da · Quy trình dịu nhẹ',
      avatarUrl:
          'https://images.unsplash.com/photo-1594824813590-b18bb3901b0b?w=200&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviewsCount: 42,
      yearsOfExperience: 5,
      isHorizontal: true,
      width: 176,
      margin: EdgeInsets.only(right: 12),
    ),
    SpecialistCard(
      name: 'Lê Hoài An',
      title: 'Chuyên viên chăm sóc cơ thể',
      specialtyDescription: 'Chạm sâu tận tâm',
      avatarUrl:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewsCount: 29,
      yearsOfExperience: 6,
      isHorizontal: true,
      width: 176,
      margin: EdgeInsets.only(right: 12),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final home = context.watch<HomeController>();
    final courseCtrl = context.watch<CourseController>();
    final user = auth.currentUser ?? AppConstants.defaultPatientUser;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBackground,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.only(bottom: 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _Header(
                name: user.name,
                onNotificationTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const NotificationsScreen(),
                    ),
                  );
                },
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: _BranchSelector(
                  selectedBranch: _selectedBranch,
                  branches: _branches,
                  onChanged: (value) => setState(() => _selectedBranch = value),
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: _SearchField(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const SearchDiscoveryScreen(),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: WelcomeBannerCard(
                  onButtonPressed: () => widget.onNavigateTab(2),
                ),
              ),
              const SizedBox(height: 20),
              CategoryChips(
                categories: home.categories,
                selectedIndex: _selectedCategoryIndex,
                onSelected: (idx) {
                  setState(() => _selectedCategoryIndex = idx);
                  home.selectCategory(home.categories[idx]);
                },
              ),
              const SizedBox(height: 22),
              _SectionHeader(
                title: 'Gợi ý dành cho bạn',
                actionText: 'Xem tất cả',
                onAction: () => widget.onNavigateTab(1),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 330,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: home.filteredServices.length,
                  itemBuilder: (context, index) {
                    final service = home.filteredServices[index];
                    return SizedBox(
                      width: 280,
                      child: Padding(
                        padding: const EdgeInsets.only(right: 14),
                        child: ServiceCard(
                          service: service,
                          actionType: ServiceCardActionType.both,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) =>
                                    ServiceDetailScreen(service: service),
                              ),
                            );
                          },
                          onBookNow: () {
                            context
                                .read<BookingController>()
                                .startBooking(service: service);
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const BookingFlowScreen(),
                              ),
                            );
                          },
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 20),
              _SectionHeader(
                title: 'Chi nhánh tiêu biểu',
                actionText: 'Xem tất cả',
                onAction: () {},
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 330,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: _branches.length,
                  itemBuilder: (context, index) {
                    final branch = _branches[index];
                    return SizedBox(
                      width: 290,
                      child: Padding(
                        padding: const EdgeInsets.only(right: 14),
                        child: BranchCard(
                          branch: branch,
                          onDirectionsTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Đang mở bản đồ đến ${branch.name}'),
                                duration: const Duration(seconds: 1),
                              ),
                            );
                          },
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 20),
              _SectionHeader(
                title: 'Chuyên viên gợi ý',
                actionText: 'Xem tất cả',
                onAction: () => widget.onNavigateTab(1),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 210,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: _specialists,
                ),
              ),
              const SizedBox(height: 20),
              _SectionHeader(
                title: 'Đào tạo & Khóa học Spa',
                actionText: 'Xem khóa học',
                onAction: () => widget.onNavigateTab(3),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 250,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: courseCtrl.courses.length,
                  itemBuilder: (context, index) {
                    final course = courseCtrl.courses[index];
                    return CourseCard(
                      course: course,
                      isHorizontal: true,
                      onTap: () {
                        courseCtrl.selectCourse(course);
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => CourseDetailScreen(course: course),
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  final String name;
  final VoidCallback onNotificationTap;

  const _Header({required this.name, required this.onNotificationTap});

  @override
  Widget build(BuildContext context) {
    final displayName = name.trim().split(' ').last;

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 14),
      child: Row(
        children: [
          const CircleAvatar(
            radius: 22,
            backgroundColor: AppColors.primaryLight,
            child: Icon(
              Icons.person_outline_rounded,
              color: AppColors.primary,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Xin chào, $displayName!',
                  style: AppTypography.cardTitle.copyWith(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  'Hôm nay bạn muốn chăm sóc bản thân như thế nào?',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.subText,
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: onNotificationTap,
            icon: Stack(
              children: [
                const Icon(
                  Icons.notifications_none_rounded,
                  color: AppColors.primary,
                  size: 24,
                ),
                Positioned(
                  right: 2,
                  top: 2,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppColors.error,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BranchSelector extends StatelessWidget {
  final String selectedBranch;
  final List<BranchModel> branches;
  final ValueChanged<String> onChanged;

  const _BranchSelector({
    required this.selectedBranch,
    required this.branches,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Chi nhánh đang chọn',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 6),
        InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: () {
            showModalBottomSheet(
              context: context,
              backgroundColor: AppColors.white,
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              builder: (ctx) => SafeArea(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Text(
                          'Chọn chi nhánh',
                          style: AppTypography.sectionTitle,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ...branches.map(
                        (branch) => ListTile(
                          title: Text(branch.name, style: AppTypography.cardTitle),
                          subtitle:
                              Text(branch.address, style: AppTypography.subText),
                          trailing: selectedBranch == branch.name
                              ? const Icon(Icons.check, color: AppColors.primary)
                              : null,
                          onTap: () {
                            onChanged(branch.name);
                            Navigator.pop(ctx);
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
          child: Container(
            height: 44,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.cardBorder),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    selectedBranch,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                const Icon(
                  Icons.keyboard_arrow_down_rounded,
                  color: AppColors.textSecondary,
                  size: 20,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _SearchField extends StatelessWidget {
  final VoidCallback onTap;

  const _SearchField({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        height: 44,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.cardBorder),
        ),
        child: const Row(
          children: [
            Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 19),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                'Tìm dịch vụ, khóa học, chuyên viên...',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 13.5,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final String actionText;
  final VoidCallback onAction;

  const _SectionHeader({
    required this.title,
    required this.actionText,
    required this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.sectionTitle,
            ),
          ),
          TextButton(
            onPressed: onAction,
            child: Text(actionText),
          ),
        ],
      ),
    );
  }
}
