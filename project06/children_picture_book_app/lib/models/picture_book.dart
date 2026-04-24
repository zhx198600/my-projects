import 'book_page.dart';

class PictureBook {
  final String id;
  final String title;
  final String coverImagePath;
  final String description;
  final List<BookPage> pages;

  int get pageCount => pages.length;

  PictureBook({
    required this.id,
    required this.title,
    required this.coverImagePath,
    required this.description,
    required this.pages,
  });

  factory PictureBook.fromJson(Map<String, dynamic> json) {
    var pagesList = (json['pages'] as List)
        .map((pageJson) => BookPage.fromJson(pageJson))
        .toList();

    return PictureBook(
      id: json['id'] as String,
      title: json['title'] as String,
      coverImagePath: json['coverImagePath'] as String,
      description: json['description'] as String,
      pages: pagesList,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'coverImagePath': coverImagePath,
      'description': description,
      'pages': pages.map((page) => page.toJson()).toList(),
    };
  }
}
