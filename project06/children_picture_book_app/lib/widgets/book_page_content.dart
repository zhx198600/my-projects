import 'package:flutter/material.dart';
import '../models/book_page.dart';
import '../models/picture_book.dart';

class BookPageContent extends StatelessWidget {
  final PictureBook book;
  final BookPage page;
  final int highlightIndex;
  final VoidCallback? onTap;

  const BookPageContent({
    super.key,
    required this.book,
    required this.page,
    this.highlightIndex = -1,
    this.onTap,
  });

  Color _getPageColor() {
    if (book.id == 'little_rabbit_adventure') {
      return Colors.pink[200]!;
    } else if (book.id == 'brave_little_turtle') {
      return Colors.teal[200]!;
    }
    return Colors.orange[200]!;
  }

  IconData _getPageIcon() {
    if (book.id == 'little_rabbit_adventure') {
      return Icons.pets;
    } else if (book.id == 'brave_little_turtle') {
      return Icons.water;
    }
    return Icons.auto_stories;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          flex: 9,
          child: _buildImageArea(context),
        ),
        Expanded(
          flex: 7,
          child: _buildTextArea(context),
        ),
      ],
    );
  }

  Widget _buildImageArea(BuildContext context) {
    final bgColor = _getPageColor();
    final icon = _getPageIcon();

    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 100,
            color: Colors.white,
          ),
          const SizedBox(height: 16),
          Text(
            '第 ${page.pageNumber} 页',
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextArea(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Center(
          child: _buildHighlightedText(),
        ),
      ),
    );
  }

  Widget _buildHighlightedText() {
    final characters = page.text.runes.map((rune) => String.fromCharCode(rune)).toList();

    if (highlightIndex < 0 || highlightIndex >= characters.length) {
      return Text(
        page.text,
        style: const TextStyle(
          fontSize: 22,
          color: Colors.black87,
          height: 1.5,
        ),
        textAlign: TextAlign.center,
      );
    }

    return RichText(
      textAlign: TextAlign.center,
      text: TextSpan(
        style: const TextStyle(
          fontSize: 22,
          height: 1.5,
        ),
        children: characters.asMap().entries.map((entry) {
          final index = entry.key;
          final char = entry.value;
          final isHighlighted = index <= highlightIndex && highlightIndex >= 0;

          return TextSpan(
            text: char,
            style: TextStyle(
              color: isHighlighted ? Colors.red : Colors.black87,
              fontWeight: isHighlighted ? FontWeight.bold : FontWeight.normal,
            ),
          );
        }).toList(),
      ),
    );
  }
}
