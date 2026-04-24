class BookPage {
  final int pageNumber;
  final String imagePath;
  final String text;
  final List<int>? wordDurations;

  BookPage({
    required this.pageNumber,
    required this.imagePath,
    required this.text,
    this.wordDurations,
  });

  factory BookPage.fromJson(Map<String, dynamic> json) {
    return BookPage(
      pageNumber: json['pageNumber'] as int,
      imagePath: json['imagePath'] as String,
      text: json['text'] as String,
      wordDurations: json['wordDurations'] != null
          ? List<int>.from(json['wordDurations'] as List)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'pageNumber': pageNumber,
      'imagePath': imagePath,
      'text': text,
      if (wordDurations != null) 'wordDurations': wordDurations,
    };
  }
}
