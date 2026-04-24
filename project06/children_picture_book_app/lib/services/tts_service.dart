import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';

enum TtsState { playing, stopped, paused, continued }

class TtsService {
  static final TtsService _instance = TtsService._internal();
  factory TtsService() => _instance;
  TtsService._internal();

  final FlutterTts _flutterTts = FlutterTts();
  
  TtsState _ttsState = TtsState.stopped;
  String? _currentText;
  int _highlightIndex = -1;
  
  Timer? _highlightTimer;
  int _estimatedCharIndex = 0;
  String? _textToSpeak;
  List<int> _validCharPositions = [];
  
  static const int _millisecondsPerChar = 250;

  VoidCallback? onStart;
  VoidCallback? onComplete;
  Function(int)? onProgress;
  VoidCallback? onPause;
  VoidCallback? onContinue;

  TtsState get state => _ttsState;
  int get highlightIndex => _highlightIndex;
  bool get isPlaying => _ttsState == TtsState.playing;
  bool get isPaused => _ttsState == TtsState.paused;

  Future<void> init() async {
    await _flutterTts.setLanguage('zh-CN');
    await _flutterTts.setSpeechRate(0.5);
    await _flutterTts.setPitch(1.0);
    await _flutterTts.setVolume(1.0);
    
    _setupHandlers();
  }

  void _setupHandlers() {
    _flutterTts.setStartHandler(() {
      _ttsState = TtsState.playing;
      _highlightIndex = 0;
      onStart?.call();
    });

    _flutterTts.setCompletionHandler(() {
      _ttsState = TtsState.stopped;
      _highlightTimer?.cancel();
      _highlightIndex = -1;
      onComplete?.call();
    });

    _flutterTts.setCancelHandler(() {
      _ttsState = TtsState.stopped;
      _highlightTimer?.cancel();
      _highlightIndex = -1;
    });

    _flutterTts.setPauseHandler(() {
      _ttsState = TtsState.paused;
      _highlightTimer?.cancel();
      onPause?.call();
    });

    _flutterTts.setContinueHandler(() {
      _ttsState = TtsState.continued;
      _resumeEstimationTimer();
      onContinue?.call();
    });

    _flutterTts.setProgressHandler((String text, int startOffset, int endOffset, String word) {
      _updateHighlightIndex(startOffset, text);
    });
  }

  void _updateHighlightIndex(int startOffset, String fullText) {
    String readText = fullText.substring(0, startOffset);
    int charCount = readText.runes.where((r) {
      final char = String.fromCharCode(r);
      return char.trim().isNotEmpty && !_isPunctuation(char);
    }).length;
    
    _highlightIndex = charCount;
    onProgress?.call(_highlightIndex);
  }

  bool _isPunctuation(String char) {
    final punctuation = RegExp(r'[，。！？、；：""''（）【】《》\s]');
    return punctuation.hasMatch(char);
  }

  Future<void> speak(String text) async {
    if (text.isEmpty) return;
    
    _currentText = text;
    _highlightIndex = -1;
    
    if (_ttsState == TtsState.playing) {
      await stop();
    }
    
    await _flutterTts.speak(text);
  }

  Future<void> speakWithEstimation(String text) async {
    if (text.isEmpty) return;
    
    _textToSpeak = text;
    _estimatedCharIndex = 0;
    _highlightIndex = 0;
    _highlightTimer?.cancel();
    
    _validCharPositions = _getValidCharPositions(text);
    
    await _flutterTts.speak(text);
    
    _startEstimationTimer();
  }

  List<int> _getValidCharPositions(String text) {
    List<int> positions = [];
    final runes = text.runes.toList();
    for (int i = 0; i < runes.length; i++) {
      final char = String.fromCharCode(runes[i]);
      if (char.trim().isNotEmpty && !_isPunctuation(char)) {
        positions.add(i);
      }
    }
    return positions;
  }

  void _startEstimationTimer() {
    if (_validCharPositions.isEmpty) return;
    
    _highlightTimer?.cancel();
    _estimatedCharIndex = 0;
    
    _highlightTimer = Timer.periodic(
      Duration(milliseconds: _millisecondsPerChar),
      (timer) {
        if (_estimatedCharIndex < _validCharPositions.length) {
          _highlightIndex = _validCharPositions[_estimatedCharIndex];
          onProgress?.call(_highlightIndex);
          _estimatedCharIndex++;
        } else {
          timer.cancel();
        }
      },
    );
  }

  void _resumeEstimationTimer() {
    if (_validCharPositions.isEmpty) return;
    
    _highlightTimer?.cancel();
    
    _highlightTimer = Timer.periodic(
      Duration(milliseconds: _millisecondsPerChar),
      (timer) {
        if (_estimatedCharIndex < _validCharPositions.length) {
          _highlightIndex = _validCharPositions[_estimatedCharIndex];
          onProgress?.call(_highlightIndex);
          _estimatedCharIndex++;
        } else {
          timer.cancel();
        }
      },
    );
  }

  Future<void> pause() async {
    await _flutterTts.pause();
  }

  Future<void> continueSpeaking() async {
    await _flutterTts.continueSpeaking();
  }

  Future<void> stop() async {
    _highlightTimer?.cancel();
    await _flutterTts.stop();
    _ttsState = TtsState.stopped;
    _highlightIndex = -1;
  }

  Future<void> dispose() async {
    _highlightTimer?.cancel();
    await stop();
  }
}
