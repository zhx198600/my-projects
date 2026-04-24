import 'package:flutter/material.dart';

class RobotMascot extends StatefulWidget {
  final bool isSpeaking;
  final double size;

  const RobotMascot({
    super.key,
    this.isSpeaking = false,
    this.size = 60,
  });

  @override
  State<RobotMascot> createState() => _RobotMascotState();
}

class _RobotMascotState extends State<RobotMascot>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _mouthAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _mouthAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeInOut,
      ),
    );
  }

  @override
  void didUpdateWidget(covariant RobotMascot oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isSpeaking != oldWidget.isSpeaking) {
      if (widget.isSpeaking) {
        _startSpeakingAnimation();
      } else {
        _stopSpeakingAnimation();
      }
    }
  }

  void _startSpeakingAnimation() {
    _animationController.repeat(reverse: true);
  }

  void _stopSpeakingAnimation() {
    _animationController.stop();
    _animationController.reset();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: widget.size,
      height: widget.size,
      decoration: BoxDecoration(
        color: Colors.blue[400],
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: AnimatedBuilder(
        animation: _mouthAnimation,
        builder: (context, child) {
          return CustomPaint(
            painter: RobotPainter(
              mouthOpen: _mouthAnimation.value,
            ),
          );
        },
      ),
    );
  }
}

class RobotPainter extends CustomPainter {
  final double mouthOpen;

  RobotPainter({required this.mouthOpen});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width * 0.35;

    // 眼睛
    final eyePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final leftEyeCenter = Offset(center.dx - radius * 0.4, center.dy - radius * 0.2);
    final rightEyeCenter = Offset(center.dx + radius * 0.4, center.dy - radius * 0.2);
    final eyeRadius = radius * 0.15;

    canvas.drawCircle(leftEyeCenter, eyeRadius, eyePaint);
    canvas.drawCircle(rightEyeCenter, eyeRadius, eyePaint);

    // 眼珠
    final pupilPaint = Paint()
      ..color = Colors.black87
      ..style = PaintingStyle.fill;

    canvas.drawCircle(
      Offset(leftEyeCenter.dx + 2, leftEyeCenter.dy),
      eyeRadius * 0.5,
      pupilPaint,
    );
    canvas.drawCircle(
      Offset(rightEyeCenter.dx + 2, rightEyeCenter.dy),
      eyeRadius * 0.5,
      pupilPaint,
    );

    // 嘴巴（根据 mouthOpen 动态变化）
    final mouthPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    final mouthCenterY = center.dy + radius * 0.25;
    final mouthWidth = radius * 0.6;
    final mouthHeight = radius * 0.15 + (mouthOpen * radius * 0.25);

    final mouthRect = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(center.dx, mouthCenterY),
        width: mouthWidth,
        height: mouthHeight,
      ),
      Radius.circular(mouthHeight / 2),
    );

    canvas.drawRRect(mouthRect, mouthPaint);

    // 嘴巴内部（黑色）
    final innerMouthPaint = Paint()
      ..color = Colors.black54
      ..style = PaintingStyle.fill;

    final innerMouthHeight = mouthHeight * 0.6;
    if (innerMouthHeight > 2) {
      final innerMouthRect = RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(center.dx, mouthCenterY),
          width: mouthWidth * 0.8,
          height: innerMouthHeight,
        ),
        Radius.circular(innerMouthHeight / 2),
      );
      canvas.drawRRect(innerMouthRect, innerMouthPaint);
    }

    // 头顶天线
    final antennaPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3;

    final antennaStartY = center.dy - radius * 0.9;
    canvas.drawLine(
      Offset(center.dx, antennaStartY),
      Offset(center.dx, antennaStartY - radius * 0.3),
      antennaPaint,
    );

    // 天线顶部小球
    final ballPaint = Paint()
      ..color = Colors.red
      ..style = PaintingStyle.fill;

    canvas.drawCircle(
      Offset(center.dx, antennaStartY - radius * 0.35),
      radius * 0.12,
      ballPaint,
    );
  }

  @override
  bool shouldRepaint(covariant RobotPainter oldDelegate) {
    return oldDelegate.mouthOpen != mouthOpen;
  }
}
