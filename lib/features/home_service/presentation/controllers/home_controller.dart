import 'package:flutter/material.dart';
import 'package:prj/core/constants/app_constants.dart';
import 'package:prj/features/home_service/domain/models/doctor_model.dart';
import 'package:prj/features/home_service/domain/models/service_model.dart';

class HomeController extends ChangeNotifier {
  List<ServiceModel> _services = [];
  List<DoctorModel> _doctors = [];
  String _selectedCategory = 'Tất cả';
  String _searchQuery = '';
  int _selectedTabIndex = 0;
  final bool _isLoading = false;

  int get selectedTabIndex => _selectedTabIndex;
  List<ServiceModel> get services => _services;
  List<DoctorModel> get doctors => _doctors;
  String get selectedCategory => _selectedCategory;
  String get searchQuery => _searchQuery;
  bool get isLoading => _isLoading;

  final List<String> categories = const [
    'Tất cả',
    'Massage',
    'Chăm sóc da',
    'Chăm sóc cơ thể',
    'Thư giãn',
    'Gói liệu trình',
  ];

  HomeController() {
    _loadData();
  }

  void _loadData() {
    _services = List.from(AppConstants.sampleServices);
    _doctors = List.from(AppConstants.sampleDoctors);
    notifyListeners();
  }

  void setTabIndex(int index) {
    _selectedTabIndex = index;
    notifyListeners();
  }

  void selectCategory(String category) {
    _selectedCategory = category;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  List<ServiceModel> get filteredServices {
    return _services.where((service) {
      final matchesCategory =
          _selectedCategory == 'Tất cả' || service.category == _selectedCategory;
      final normalizedQuery = _searchQuery.toLowerCase();
      final matchesQuery = normalizedQuery.isEmpty ||
          service.name.toLowerCase().contains(normalizedQuery) ||
          service.category.toLowerCase().contains(normalizedQuery);
      return matchesCategory && matchesQuery;
    }).toList();
  }

  DoctorModel? getDoctorById(String id) {
    try {
      return _doctors.firstWhere((doctor) => doctor.id == id);
    } catch (_) {
      return null;
    }
  }

  ServiceModel? getServiceById(String id) {
    try {
      return _services.firstWhere((service) => service.id == id);
    } catch (_) {
      return null;
    }
  }
}
