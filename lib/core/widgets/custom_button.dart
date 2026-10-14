import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

enum ButtonType { primary, outline, text, icon }

class CustomButton extends StatelessWidget {
  final String? text;
  final VoidCallback? onPressed;
  final ButtonType type;
  final bool isLoading;
  final bool isDisabled;
  final IconData? icon;
  final Color? backgroundColor;
  final Color? textColor;
  final double? width;
  final double height;
  final double borderRadius;
  final EdgeInsetsGeometry? padding;

  const CustomButton({
    super.key,
    this.text,
    required this.onPressed,
    this.type = ButtonType.primary,
    this.isLoading = false,
    this.isDisabled = false,
    this.icon,
    this.backgroundColor,
    this.textColor,
    this.width,
    this.height = 46,
    this.borderRadius = 10,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveDisabled = isDisabled || isLoading || onPressed == null;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Widget content;
    if (isLoading) {
      content = SizedBox(
        height: 18,
        width: 18,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(
            type == ButtonType.primary ? Colors.white : AppColors.primary,
          ),
        ),
      );
    } else {
      final children = <Widget>[];
      if (icon != null) {
        children.add(Icon(icon, size: 18));
      }
      if (icon != null && text != null) {
        children.add(const SizedBox(width: 8));
      }
      if (text != null) {
        children.add(
          Text(
            text!,
            style: AppTypography.buttonText.copyWith(
              color: _getTextColor(context, effectiveDisabled, isDark),
            ),
          ),
        );
      }
      content = Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: children,
      );
    }

    Widget button;
    switch (type) {
      case ButtonType.primary:
        button = ElevatedButton(
          onPressed: effectiveDisabled ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: backgroundColor ?? AppColors.primary,
            disabledBackgroundColor: isDark ? const Color(0xFF333333) : const Color(0xFFE5DDD5),
            foregroundColor: textColor ?? Colors.white,
            elevation: 0,
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(borderRadius),
            ),
            padding: padding ?? const EdgeInsets.symmetric(horizontal: 18),
          ),
          child: content,
        );
        break;

      case ButtonType.outline:
        button = OutlinedButton(
          onPressed: effectiveDisabled ? null : onPressed,
          style: OutlinedButton.styleFrom(
            foregroundColor: textColor ?? AppColors.primary,
            side: BorderSide(
              color: effectiveDisabled
                  ? (isDark ? const Color(0xFF424242) : AppColors.borderLight)
                  : (backgroundColor ?? AppColors.primary),
              width: 1,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(borderRadius),
            ),
            padding: padding ?? const EdgeInsets.symmetric(horizontal: 18),
          ),
          child: content,
        );
        break;

      case ButtonType.text:
        button = TextButton(
          onPressed: effectiveDisabled ? null : onPressed,
          style: TextButton.styleFrom(
            foregroundColor: textColor ?? AppColors.primary,
            padding: padding ?? const EdgeInsets.symmetric(horizontal: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(borderRadius),
            ),
          ),
          child: content,
        );
        break;

      case ButtonType.icon:
        return SizedBox(
          width: height,
          height: height,
          child: Material(
            color: backgroundColor ?? (isDark ? AppColors.surfaceDark : AppColors.surfaceLight),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(borderRadius),
              side: BorderSide(
                color: isDark ? AppColors.borderDark : AppColors.borderLight,
                width: 1,
              ),
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(borderRadius),
              onTap: effectiveDisabled ? null : onPressed,
              child: Center(
                child: isLoading
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Icon(
                        icon,
                        color: textColor ?? (isDark ? Colors.white : AppColors.textPrimaryLight),
                        size: 20,
                      ),
              ),
            ),
          ),
        );
    }

    if (width != null) {
      return SizedBox(width: width, height: height, child: button);
    }
    return SizedBox(height: height, child: button);
  }

  Color _getTextColor(BuildContext context, bool isDisabled, bool isDark) {
    if (textColor != null) return textColor!;
    if (isDisabled) {
      return isDark ? const Color(0xFF707070) : AppColors.textSecondary;
    }
    switch (type) {
      case ButtonType.primary:
        return Colors.white;
      case ButtonType.outline:
        return AppColors.primary;
      case ButtonType.text:
        return AppColors.primary;
      case ButtonType.icon:
        return isDark ? Colors.white : AppColors.textPrimaryLight;
    }
  }
}
