import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

class BranchModel {
  final String id;
  final String name;
  final String tag;
  final String address;
  final String openingHours;
  final String phone;
  final String imageUrl;

  const BranchModel({
    required this.id,
    required this.name,
    this.tag = 'Cơ sở mô hình spa',
    required this.address,
    required this.openingHours,
    this.phone = 'Chi nhánh MLD: 039.3856.549',
    required this.imageUrl,
  });
}

class BranchCard extends StatelessWidget {
  final BranchModel branch;
  final VoidCallback? onTap;
  final VoidCallback? onDirectionsTap;
  final VoidCallback? onDetailTap;
  final double? width;
  final EdgeInsetsGeometry margin;

  const BranchCard({
    super.key,
    required this.branch,
    this.onTap,
    this.onDirectionsTap,
    this.onDetailTap,
    this.width,
    this.margin = const EdgeInsets.only(bottom: 16),
  });

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
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: AspectRatio(
                    aspectRatio: 16 / 9,
                    child: Image.network(
                      branch.imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => Container(
                        color: AppColors.primaryLight,
                        child: const Icon(
                          Icons.storefront_outlined,
                          color: AppColors.primary,
                          size: 34,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  branch.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.cardTitle.copyWith(
                    color: isDark
                        ? AppColors.textPrimaryDark
                        : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                _InfoRow(icon: Icons.location_on_outlined, text: branch.address),
                const SizedBox(height: 6),
                _InfoRow(icon: Icons.schedule_rounded, text: branch.openingHours),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: onDirectionsTap,
                    icon: const Icon(Icons.directions_outlined, size: 17),
                    label: const Text('Chỉ đường'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InfoRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 15, color: AppColors.textSecondary),
        const SizedBox(width: 5),
        Expanded(
          child: Text(
            text,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: AppTypography.subText,
          ),
        ),
      ],
    );
  }
}
