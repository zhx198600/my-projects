import 'package:flutter/material.dart';
import 'package:children_picture_book_app/screens/home_screen.dart';
import 'package:children_picture_book_app/screens/reading_screen.dart';

void main() {
  runApp(const ChildrenPictureBookApp());
}

class ChildrenPictureBookApp extends StatelessWidget {
  const ChildrenPictureBookApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '儿童绘本',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.light,
        ),
        primaryColor: Colors.blue[400],
        scaffoldBackgroundColor: const Color(0xFFFFF8E1),
        appBarTheme: AppBarTheme(
          backgroundColor: Colors.blue[400],
          foregroundColor: Colors.white,
          elevation: 0,
          centerTitle: true,
          titleTextStyle: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        textTheme: const TextTheme(
          bodyLarge: TextStyle(fontSize: 18, color: Colors.black87),
          bodyMedium: TextStyle(fontSize: 16, color: Colors.black87),
          titleLarge: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
          titleMedium: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        cardTheme: CardTheme(
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue[400],
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            textStyle: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
      home: const HomeScreen(),
      routes: {
        '/home': (context) => const HomeScreen(),
      },
      onGenerateRoute: (settings) {
        if (settings.name == '/reading') {
          final args = settings.arguments as Map<String, dynamic>;
          return MaterialPageRoute(
            builder: (context) => ReadingScreen(
              bookId: args['bookId'] as String,
            ),
          );
        }
        return null;
      },
    );
  }
}
