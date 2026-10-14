import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../../features/home_service/domain/models/doctor_model.dart';

class SpecialistCard extends StatelessWidget {
  final String name;
  final String title;
  final String? tag;
  final String? specialtyDescription;
  final String avatarUrl;
  final double rating;
  final int reviewsCount;
  final int yearsOfExperience;
  final VoidCallback? onTap;
  final VoidCallback? onProfileTap;
  final bool isHorizontal;
  final double? width;
  final EdgeInsetsGeometry margin;

  const SpecialistCard({
    super.key,
    required this.name,
    required this.title,
    this.tag,
    this.specialtyDescription,
    required this.avatarUrl,
    this.rating = 4.8,
    this.reviewsCount = 12,
    this.yearsOfExperience = 4,
    this.onTap,
    this.onProfileTap,
    this.isHorizontal = false,
    this.width,
    this.margin = const EdgeInsets.only(bottom: 12),
  });

  factory SpecialistCard.fromDoctor({
    Key? key,
    required DoctorModel doctor,
    VoidCallback? onTap,
    VoidCallback? onProfileTap,
    bool isHorizontal = false,
    double? width,
    EdgeInsetsGeometry margin = const EdgeInsets.only(bottom: 12),
  }) {
    return SpecialistCard(
      key: key,
      name: doctor.name,
      title: doctor.specialty.isNotEmpty ? doctor.specialty : doctor.title,
      specialtyDescription:
          doctor.bio.isNotEmpty ? doctor.bio : 'Chăm sóc tận tâm',
      avatarUrl: doctor.avatarUrl,
      rating: doctor.rating,
      reviewsCount: doctor.reviewsCount,
      yearsOfExperience: doctor.yearsOfExperience,
      onTap: onTap,
      onProfileTap: onProfileTap ?? onTap,
      isHorizontal: isHorizontal,
      width: width,
      margin: margin,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: width,
      margin: margin,
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.cardBorder,
        ),
        boxShadow: AppColors.cardShadow,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: isHorizontal ? _horizontal(context) : _wide(context),
          ),
        ),
      ),
    );
  }

  Widget _horizontal(BuildContext context) {
    return Column(
      children: [
        _avatar(),
        const SizedBox(height: 10),
        Text(
          name,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
          style: AppTypography.cardTitle,
        ),
        const SizedBox(height: 3),
        Text(
          title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
          style: AppTypography.subText,
        ),
        const Spacer(),
        _ratingRow(mainAxisAlignment: MainAxisAlignment.center),
        const SizedBox(height: 8),
        TextButton(
          onPressed: onProfileTap ?? onTap,
          child: const Text('Xem hồ sơ'),
        ),
      ],
    );
  }

  Widget _wide(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _avatar(),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (tag != null && tag!.isNotEmpty) ...[
                Text(
                  tag!,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.subText.copyWith(
                    color: AppColors.primary,
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
              ],
              Text(
                name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTypography.cardTitle,
              ),
              const SizedBox(height: 2),
              Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTypography.subText,
              ),
              if (specialtyDescription != null &&
                  specialtyDescription!.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(
                  specialtyDescription!,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.subText,
                ),
              ],
              const SizedBox(height: 8),
              _ratingRow(),
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton(
                  onPressed: onProfileTap ?? onTap,
                  child: const Text('Xem hồ sơ'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _avatar() {
    return CircleAvatar(
      radius: 28,
      backgroundColor: AppColors.primaryLight,
      backgroundImage: NetworkImage(avatarUrl),
      onBackgroundImageError: (_, _) {},
      child: avatarUrl.isEmpty
          ? const Icon(Icons.person_outline, color: AppColors.primary)
          : null,
    );
  }

  Widget _ratingRow({
    MainAxisAlignment mainAxisAlignment = MainAxisAlignment.start,
  }) {
    return Row(
      mainAxisAlignment: mainAxisAlignment,
      children: [
        const Icon(Icons.star_rounded, color: AppColors.gold, size: 15),
        const SizedBox(width: 3),
        Text(
          rating.toStringAsFixed(1),
          style: AppTypography.subText.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
        Text(
          ' · $yearsOfExperience năm KN',
          style: AppTypography.subText.copyWith(fontSize: 11.5),
        ),
      ],
    );
  }
}
