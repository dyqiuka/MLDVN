import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../utils/formatters.dart';
import '../../features/home_service/domain/models/service_model.dart';

enum ServiceCardActionType { detailOnly, bookOnly, both }

class ServiceCard extends StatelessWidget {
  final ServiceModel service;
  final VoidCallback onTap;
  final VoidCallback? onBookNow;
  final VoidCallback? onFavoriteToggle;
  final bool isFavorite;
  final ServiceCardActionType actionType;
  final double? width;
  final EdgeInsetsGeometry margin;

  const ServiceCard({
    super.key,
    required this.service,
    required this.onTap,
    this.onBookNow,
    this.onFavoriteToggle,
    this.isFavorite = false,
    this.actionType = ServiceCardActionType.both,
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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  ClipRRect(
                    borderRadius:
                        const BorderRadius.vertical(top: Radius.circular(16)),
                    child: AspectRatio(
                      aspectRatio: 16 / 9,
                      child: Image.network(
                        service.imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => Container(
                          color: AppColors.primaryLight,
                          child: const Icon(
                            Icons.spa_outlined,
                            color: AppColors.primary,
                            size: 34,
                          ),
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 10,
                    right: 10,
                    child: InkResponse(
                      onTap: onFavoriteToggle,
                      radius: 20,
                      child: Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: AppColors.white.withValues(alpha: 0.95),
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x14000000),
                              blurRadius: 4,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Icon(
                          isFavorite
                              ? Icons.favorite_rounded
                              : Icons.favorite_border_rounded,
                          color: isFavorite ? AppColors.error : AppColors.primary,
                          size: 18,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      service.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppTypography.cardTitle.copyWith(
                        color: isDark
                            ? AppColors.textPrimaryDark
                            : AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 9),
                    Row(
                      children: [
                        Icon(
                          Icons.schedule_rounded,
                          size: 15,
                          color: isDark
                              ? AppColors.textSecondaryDark
                              : AppColors.textSecondary,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          Formatters.formatDurationMinutes(
                            service.durationMinutes,
                          ),
                          style: AppTypography.subText,
                        ),
                        const Spacer(),
                        Text(
                          Formatters.formatCurrency(service.price),
                          style: AppTypography.priceTag,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _Actions(
                      actionType: actionType,
                      onDetail: onTap,
                      onBook: onBookNow,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Actions extends StatelessWidget {
  final ServiceCardActionType actionType;
  final VoidCallback onDetail;
  final VoidCallback? onBook;

  const _Actions({
    required this.actionType,
    required this.onDetail,
    required this.onBook,
  });

  @override
  Widget build(BuildContext context) {
    final showDetail = actionType != ServiceCardActionType.bookOnly;
    final showBook = actionType != ServiceCardActionType.detailOnly;

    if (showDetail && showBook) {
      return Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: onDetail,
              child: const Text('Xem chi tiết'),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: ElevatedButton(
              onPressed: onBook,
              child: const Text('Đặt lịch'),
            ),
          ),
        ],
      );
    }

    if (showBook) {
      return SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: onBook,
          child: const Text('Đặt lịch'),
        ),
      );
    }

    return Align(
      alignment: Alignment.centerLeft,
      child: TextButton(
        onPressed: onDetail,
        child: const Text('Xem chi tiết'),
      ),
    );
  }
}
