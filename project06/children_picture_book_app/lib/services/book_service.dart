import 'dart:convert';
import 'package:flutter/services.dart';
import '../models/picture_book.dart';

class BookService {
  static final BookService _instance = BookService._internal();
  factory BookService() => _instance;
  BookService._internal();

  List<PictureBook> _books = [];

  /// 从assets加载所有绘本数据
  Future<List<PictureBook>> loadBooks() async {
    String jsonString = await rootBundle.loadString('assets/books.json');
    Map<String, dynamic> jsonData = jsonDecode(jsonString);
    
    List<dynamic> booksList = jsonData['books'] as List;
    _books = booksList.map((bookJson) => PictureBook.fromJson(bookJson)).toList();
    
    return _books;
  }

  /// 根据ID获取绘本
  PictureBook? getBookById(String id) {
    try {
      return _books.firstWhere((book) => book.id == id);
    } catch (e) {
      return null;
    }
  }

  /// 获取所有绘本
  List<PictureBook> getAllBooks() {
    return _books;
  }
}
