import 'package:flutter/material.dart';
import '../models/picture_book.dart';
import '../services/book_service.dart';
import '../services/tts_service.dart';
import '../widgets/page_indicator.dart';
import '../widgets/book_page_content.dart';
import '../widgets/robot_mascot.dart';

class ReadingScreen extends StatefulWidget {
  final String bookId;
  final Function(int)? onPageChanged;
  final VoidCallback? onPlayPressed;
  final VoidCallback? onPausePressed;

  const ReadingScreen({
    super.key,
    required this.bookId,
    this.onPageChanged,
    this.onPlayPressed,
    this.onPausePressed,
  });

  @override
  State<ReadingScreen> createState() => _ReadingScreenState();
}

class _ReadingScreenState extends State<ReadingScreen> {
  PictureBook? _book;
  int _currentPageIndex = 0;
  bool _isLoading = true;
  bool _isPlaying = false;
  int _highlightIndex = -1;
  PageController? _pageController;
  TtsService? _ttsService;

  @override
  void initState() {
    super.initState();
    _initTts();
    _loadBook();
  }

  @override
  void dispose() {
    _ttsService?.dispose();
    _pageController?.dispose();
    super.dispose();
  }

  Future<void> _initTts() async {
    _ttsService = TtsService();
    await _ttsService!.init();

    _ttsService!.onStart = () {
      if (mounted) {
        setState(() {
          _isPlaying = true;
        });
      }
    };

    _ttsService!.onComplete = () {
      if (mounted) {
        setState(() {
          _isPlaying = false;
          _highlightIndex = -1;
        });
      }
    };

    _ttsService!.onProgress = (index) {
      if (mounted) {
        setState(() {
          _highlightIndex = index;
        });
      }
    };

    _ttsService!.onPause = () {
      if (mounted) {
        setState(() {
          _isPlaying = false;
        });
      }
    };

    _ttsService!.onContinue = () {
      if (mounted) {
        setState(() {
          _isPlaying = true;
        });
      }
    };
  }

  Future<void> _loadBook() async {
    final bookService = BookService();
    if (bookService.getAllBooks().isEmpty) {
      await bookService.loadBooks();
    }
    setState(() {
      _book = bookService.getBookById(widget.bookId);
      _isLoading = false;
    });
    if (_book != null) {
      _pageController = PageController(initialPage: _currentPageIndex);
      // 延迟一点后自动朗读第一页
      Future.delayed(const Duration(milliseconds: 500), () {
        if (mounted && _book != null && _ttsService != null) {
          final currentText = _book!.pages[_currentPageIndex].text;
          _ttsService!.speakWithEstimation(currentText);
        }
      });
    }
  }

  void _nextPage() {
    if (_book == null || _currentPageIndex >= _book!.pageCount - 1) return;
    _pageController?.nextPage(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  void _previousPage() {
    if (_currentPageIndex <= 0) return;
    _pageController?.previousPage(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  void _togglePlay() {
    if (_ttsService == null || _book == null) return;

    final currentText = _book!.pages[_currentPageIndex].text;

    if (_ttsService!.isPlaying) {
      _ttsService!.pause();
    } else if (_ttsService!.isPaused) {
      _ttsService!.continueSpeaking();
    } else {
      _ttsService!.speakWithEstimation(currentText);
    }
  }

  void _handlePageChanged(int index) {
    _ttsService?.stop();
    setState(() {
      _currentPageIndex = index;
      _highlightIndex = -1;
      _isPlaying = false;
    });
    widget.onPageChanged?.call(index);
    _onPageFlipComplete(index);
  }

  void _onPageFlipComplete(int pageIndex) {
    // 翻页完成后自动开始朗读
    if (_book != null && _ttsService != null) {
      final currentText = _book!.pages[pageIndex].text;
      _ttsService!.speakWithEstimation(currentText);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_book == null) {
      return Scaffold(
        appBar: AppBar(
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: const Center(child: Text('绘本不存在')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_book!.title),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: _buildPageView(),
          ),
          _buildBottomBar(),
        ],
      ),
      floatingActionButton: _buildRobotMascot(),
    );
  }

  Widget _buildPageView() {
    if (_pageController == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return PageView.builder(
      controller: _pageController,
      itemCount: _book!.pageCount,
      onPageChanged: _handlePageChanged,
      physics: const BouncingScrollPhysics(),
      itemBuilder: (context, index) {
        final page = _book!.pages[index];
        return BookPageContent(
          book: _book!,
          page: page,
          highlightIndex: index == _currentPageIndex ? _highlightIndex : -1,
        );
      },
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 4,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          PageIndicator(
            currentPage: _currentPageIndex + 1,
            totalPages: _book!.pageCount,
          ),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back_ios),
                onPressed: _currentPageIndex > 0 ? _previousPage : null,
                color: _currentPageIndex > 0 ? Colors.blue : Colors.grey,
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: _togglePlay,
                icon: Icon(_isPlaying ? Icons.pause : Icons.play_arrow),
                label: Text(_isPlaying ? '暂停' : '朗读'),
              ),
              const SizedBox(width: 8),
              IconButton(
                icon: const Icon(Icons.arrow_forward_ios),
                onPressed: _currentPageIndex < _book!.pageCount - 1 ? _nextPage : null,
                color: _currentPageIndex < _book!.pageCount - 1 ? Colors.blue : Colors.grey,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRobotMascot() {
    return RobotMascot(
      isSpeaking: _isPlaying,
      size: 70,
    );
  }
}
