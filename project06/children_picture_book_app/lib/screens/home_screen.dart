import 'package:flutter/material.dart';
import 'package:children_picture_book_app/services/book_service.dart';
import 'package:children_picture_book_app/models/picture_book.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<List<PictureBook>> _booksFuture;

  @override
  void initState() {
    super.initState();
    _booksFuture = BookService().loadBooks();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('儿童绘本'),
        actions: [
          IconButton(
            icon: const Icon(Icons.info),
            onPressed: () {
              _showAboutDialog(context);
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '选择一本绘本开始阅读吧！',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.blue,
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: FutureBuilder<List<PictureBook>>(
                future: _booksFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(
                      child: CircularProgressIndicator(),
                    );
                  } else if (snapshot.hasError) {
                    return _buildErrorState(context);
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return _buildEmptyState(context);
                  } else {
                    final books = snapshot.data!;
                    return _buildBookGrid(context, books);
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            size: 80,
            color: Colors.red,
          ),
          const SizedBox(height: 16),
          const Text(
            '加载绘本数据失败',
            style: TextStyle(
              fontSize: 18,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _booksFuture = BookService().loadBooks();
              });
            },
            child: const Text('重试'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.menu_book_outlined,
            size: 80,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            '暂无绘本',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookGrid(BuildContext context, List<PictureBook> books) {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 0.75,
      children: books.map((book) {
        return _buildBookCard(context, book);
      }).toList(),
    );
  }

  Widget _buildBookCard(BuildContext context, PictureBook book) {
    final cardColor = _getCardColor(book.id);
    final cardIcon = _getCardIcon(book.id);

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.pushNamed(
            context,
            '/reading',
            arguments: {'bookId': book.id},
          );
        },
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                cardColor,
                cardColor.withOpacity(0.7),
              ],
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                cardIcon,
                size: 70,
                color: Colors.white,
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                child: Text(
                  book.title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 8),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12.0),
                child: Text(
                  book.description,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withOpacity(0.9),
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.auto_stories,
                    size: 16,
                    color: Colors.white.withOpacity(0.8),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${book.pageCount} 页',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getCardColor(String bookId) {
    if (bookId == 'little_rabbit_adventure') {
      return Colors.pink[300]!;
    } else if (bookId == 'brave_little_turtle') {
      return Colors.orange[300]!;
    }
    return Colors.teal[300]!;
  }

  IconData _getCardIcon(String bookId) {
    if (bookId == 'little_rabbit_adventure') {
      return Icons.pets;
    } else if (bookId == 'brave_little_turtle') {
      return Icons.fish;
    }
    return Icons.menu_book;
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('关于儿童绘本'),
          content: const Text(
            '这是一款专为3-10岁儿童设计的绘本阅读应用。\n\n'
            '功能包括：\n'
            '• 仿真翻页效果\n'
            '• 语音朗读功能\n'
            '• 逐字高亮显示\n'
            '• 可爱的机器人吉祥物',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('确定'),
            ),
          ],
        );
      },
    );
  }
}
