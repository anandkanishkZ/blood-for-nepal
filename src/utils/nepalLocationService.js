// Nepal Location Service - Simplified for dropdown selection
// This service provides access to real Nepal location data including provinces, districts, and municipalities

class NepalLocationService {
  constructor() {
    this.provinces = null;
    this.districts = null;
    this.districtsByProvince = new Map();
    this.municipalsByDistrict = new Map();
    this.isLoaded = false;
  }

  // Initialize the service by loading basic data
  async initialize() {
    if (this.isLoaded) return;

    try {
      // Load provinces
      const provincesResponse = await import('../data/locations/provinces.json');
      this.provinces = provincesResponse.provinces;

      // Load all districts
      const districtsResponse = await import('../data/locations/districts.json');
      this.districts = districtsResponse.districts;

      this.isLoaded = true;
      console.log('Nepal location service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Nepal location service:', error);
      throw error;
    }
  }

  // Build comprehensive search indexes for optimized searching
  async buildSearchIndexes() {
    const startTime = performance.now();
    console.log('Building search indexes...');
    
    this.searchIndex.clear();
    this.phoneticIndex.clear();
    this.locationKeywords.clear();
    
    const allLocations = [];
    
    // Build province, district, and municipality data with indexes
    for (const province of this.provinces) {
      const provinceData = {
        id: province,
        name: this.formatLocationName(province),
        type: 'province',
        searchTerms: this.generateSearchTerms(province),
        phoneticKey: this.generatePhoneticKey(province)
      };
      
      allLocations.push(provinceData);
      this.addToSearchIndex(provinceData);
      
      const districts = await this.getDistrictsByProvince(province);
      for (const district of districts) {
        const districtData = {
          id: district.id,
          name: district.name,
          type: 'district',
          province: provinceData.name,
          searchTerms: this.generateSearchTerms(district.name),
          phoneticKey: this.generatePhoneticKey(district.name)
        };
        
        allLocations.push(districtData);
        this.addToSearchIndex(districtData);
        
        const municipalities = await this.getMunicipalitiesByDistrict(district.id);
        for (const municipality of municipalities) {
          const municipalityData = {
            id: municipality.id,
            name: municipality.name,
            type: 'municipality',
            province: provinceData.name,
            district: district.name,
            searchTerms: this.generateSearchTerms(municipality.name),
            phoneticKey: this.generatePhoneticKey(municipality.name)
          };
          
          allLocations.push(municipalityData);
          this.addToSearchIndex(municipalityData);
        }
      }
    }
    
    this.allLocationsFlat = allLocations;
    
    const endTime = performance.now();
    console.log(`Search indexes built in ${(endTime - startTime).toFixed(2)}ms for ${allLocations.length} locations`);
  }

  // Generate search terms including variations and common misspellings
  generateSearchTerms(text) {
    const normalized = this.normalizeText(text);
    const terms = new Set([normalized]);
    
    // Add individual words
    normalized.split(' ').forEach(word => {
      if (word.length > 2) terms.add(word);
    });
    
    // Add common variations
    const variations = this.getLocationVariations(normalized);
    variations.forEach(variation => terms.add(variation));
    
    return Array.from(terms);
  }

  // Generate phonetic key for approximate matching
  generatePhoneticKey(text) {
    return this.normalizeText(text)
      .replace(/[aeiou]/g, '') // Remove vowels for rough phonetic matching
      .replace(/[^a-z]/g, '')  // Keep only consonants
      .substring(0, 4);        // Take first 4 consonants
  }

  // Add location to search indexes
  addToSearchIndex(location) {
    // Add to main search index
    location.searchTerms.forEach(term => {
      if (!this.searchIndex.has(term)) {
        this.searchIndex.set(term, []);
      }
      this.searchIndex.get(term).push(location);
    });
    
    // Add to phonetic index
    if (!this.phoneticIndex.has(location.phoneticKey)) {
      this.phoneticIndex.set(location.phoneticKey, []);
    }
    this.phoneticIndex.get(location.phoneticKey).push(location);
    
    // Add keywords
    const keywords = this.extractKeywords(location.name);
    keywords.forEach(keyword => {
      if (!this.locationKeywords.has(keyword)) {
        this.locationKeywords.set(keyword, []);
      }
      this.locationKeywords.get(keyword).push(location);
    });
  }

  // Get common location name variations
  getLocationVariations(text) {
    const variations = [];
    
    // Common Nepal location variations
    const commonVariations = {
      'kathmandu': ['ktm', 'katmandu'],
      'pokhara': ['pokhra'],
      'bhaktapur': ['bhadgaun', 'bhaktpur'],
      'lalitpur': ['patan'],
      'chitwan': ['chitawan'],
      'janakpur': ['janakpurdham'],
      'biratnagar': ['birat', 'biratngar'],
      'nepalgunj': ['nepalganj'],
      'dhangadhi': ['dhangadi'],
      'butwal': ['butwaal'],
      'hetauda': ['hetauda'],
      'itahari': ['ithari'],
      'bharatpur': ['bharatpoor'],
      'birgunj': ['birganj'],
      'dharan': ['dharan'],
      'tulsipur': ['tulsipoor']
    };
    
    for (const [standard, vars] of Object.entries(commonVariations)) {
      if (text.includes(standard)) {
        variations.push(...vars);
      }
      if (vars.includes(text)) {
        variations.push(standard);
      }
    }
    
    return variations;
  }

  // Extract keywords from location name
  extractKeywords(text) {
    const keywords = [];
    const normalized = this.normalizeText(text);
    
    // Split by common delimiters
    const words = normalized.split(/[\s-_]+/);
    
    words.forEach(word => {
      if (word.length >= 3) {
        keywords.push(word);
        
        // Add prefixes for partial matching
        for (let i = 3; i <= word.length; i++) {
          keywords.push(word.substring(0, i));
        }
      }
    });
    
    return keywords;
  }

  // Normalize text for consistent searching
  normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  }

  // Get all provinces
  async getProvinces() {
    await this.initialize();
    return this.provinces.map(province => ({
      id: province,
      name: this.formatLocationName(province),
      value: province
    }));
  }

  // Get districts for a specific province
  async getDistrictsByProvince(provinceId) {
    await this.initialize();
    
    if (!this.districtsByProvince.has(provinceId)) {
      try {
        const response = await import(`../data/locations/districtsByProvince/${provinceId}.json`);
        // Clean district names (trim whitespace and normalize)
        const cleanDistricts = response.districts.map(district => {
          const cleaned = district.trim();
          if (cleaned !== district) {
            console.warn(`Cleaned district name: "${district}" -> "${cleaned}"`);
          }
          return cleaned;
        });
        this.districtsByProvince.set(provinceId, cleanDistricts);
      } catch (error) {
        console.error(`Failed to load districts for province ${provinceId}:`, error);
        return [];
      }
    }

    const districts = this.districtsByProvince.get(provinceId) || [];
    return districts.map(district => ({
      id: district,
      name: this.formatLocationName(district),
      value: district,
      province: provinceId
    }));
  }

  // Get municipalities for a specific district
  async getMunicipalitiesByDistrict(districtId) {
    await this.initialize();
    
    if (!this.municipalsByDistrict.has(districtId)) {
      try {
        const filename = this.getDistrictFilename(districtId);
        console.log(`Loading municipalities for district: "${districtId}" -> file: "${filename}.json"`);
        const response = await import(`../data/locations/municipalsByDistrict/${filename}.json`);
        this.municipalsByDistrict.set(districtId, response.municipals);
      } catch (error) {
        console.error(`Failed to load municipalities for district "${districtId}" (file: ${this.getDistrictFilename(districtId)}.json):`, error);
        return [];
      }
    }

    const municipalities = this.municipalsByDistrict.get(districtId) || [];
    return municipalities.map(municipal => ({
      id: municipal,
      name: this.formatLocationName(municipal),
      value: municipal,
      district: districtId
    }));
  }

  // Enhanced search with multiple algorithms and ranking
  async searchLocations(query) {
    await this.initialize();
    
    if (!query || query.length < 1) return [];

    const startTime = performance.now();
    const normalizedQuery = this.normalizeText(query);
    const phoneticKey = this.generatePhoneticKey(query);
    const results = new Map(); // Use Map to avoid duplicates
    
    // 1. Exact matches (highest priority)
    const exactMatches = this.searchIndex.get(normalizedQuery) || [];
    exactMatches.forEach(location => {
      results.set(location.id + location.type, {
        ...location,
        score: 100,
        matchType: 'exact'
      });
    });
    
    // 2. Prefix matches
    for (const [term, locations] of this.searchIndex.entries()) {
      if (term.startsWith(normalizedQuery) && term !== normalizedQuery) {
        locations.forEach(location => {
          const key = location.id + location.type;
          if (!results.has(key)) {
            results.set(key, {
              ...location,
              score: 85 - (term.length - normalizedQuery.length) * 2,
              matchType: 'prefix'
            });
          }
        });
      }
    }
    
    // 3. Contains matches
    for (const [term, locations] of this.searchIndex.entries()) {
      if (term.includes(normalizedQuery) && !term.startsWith(normalizedQuery)) {
        locations.forEach(location => {
          const key = location.id + location.type;
          if (!results.has(key)) {
            const position = term.indexOf(normalizedQuery);
            results.set(key, {
              ...location,
              score: 70 - position * 2,
              matchType: 'contains'
            });
          }
        });
      }
    }
    
    // 4. Phonetic matches
    const phoneticMatches = this.phoneticIndex.get(phoneticKey) || [];
    phoneticMatches.forEach(location => {
      const key = location.id + location.type;
      if (!results.has(key)) {
        results.set(key, {
          ...location,
          score: 50,
          matchType: 'phonetic'
        });
      }
    });
    
    // 5. Fuzzy matches for short queries
    if (normalizedQuery.length <= 6 && results.size < 5) {
      for (const [term, locations] of this.searchIndex.entries()) {
        if (Math.abs(term.length - normalizedQuery.length) <= 2) {
          const similarity = this.calculateAdvancedSimilarity(normalizedQuery, term);
          if (similarity > 0.6) {
            locations.forEach(location => {
              const key = location.id + location.type;
              if (!results.has(key)) {
                results.set(key, {
                  ...location,
                  score: similarity * 45,
                  matchType: 'fuzzy'
                });
              }
            });
          }
        }
      }
    }
    
    // 6. Keyword partial matches
    const keywords = this.extractKeywords(normalizedQuery);
    keywords.forEach(keyword => {
      const keywordMatches = this.locationKeywords.get(keyword) || [];
      keywordMatches.forEach(location => {
        const key = location.id + location.type;
        if (!results.has(key)) {
          results.set(key, {
            ...location,
            score: 35,
            matchType: 'keyword'
          });
        }
      });
    });
    
    // Convert to array and sort by score and type preference
    const sortedResults = Array.from(results.values())
      .sort((a, b) => {
        // Primary sort: score
        if (b.score !== a.score) return b.score - a.score;
        
        // Secondary sort: type preference (municipality > district > province)
        const typeOrder = { municipality: 3, district: 2, province: 1 };
        if (typeOrder[b.type] !== typeOrder[a.type]) {
          return typeOrder[b.type] - typeOrder[a.type];
        }
        
        // Tertiary sort: alphabetical
        return a.name.localeCompare(b.name);
      })
      .slice(0, 12) // Increased limit for better results
      .map(result => ({
        ...result,
        fullPath: this.buildFullPath(result),
        highlight: this.getHighlightedText(result.name, query)
      }));
    
    const endTime = performance.now();
    console.log(`Search completed in ${(endTime - startTime).toFixed(2)}ms for query: "${query}" (${sortedResults.length} results)`);
    
    return sortedResults;
  }

  // Advanced similarity calculation with multiple algorithms
  calculateAdvancedSimilarity(str1, str2) {
    // Jaro-Winkler distance for better fuzzy matching
    const jaroSimilarity = this.jaroSimilarity(str1, str2);
    
    // Levenshtein distance
    const levenshteinSim = this.levenshteinSimilarity(str1, str2);
    
    // Longest common subsequence
    const lcsSim = this.longestCommonSubsequence(str1, str2) / Math.max(str1.length, str2.length);
    
    // Weighted average
    return (jaroSimilarity * 0.5) + (levenshteinSim * 0.3) + (lcsSim * 0.2);
  }

  // Jaro similarity algorithm
  jaroSimilarity(s1, s2) {
    if (s1.length === 0 && s2.length === 0) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;
    
    const match_window = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
    if (match_window < 0) return 0;
    
    const s1_matches = new Array(s1.length).fill(false);
    const s2_matches = new Array(s2.length).fill(false);
    
    let matches = 0;
    let transpositions = 0;
    
    // Find matches
    for (let i = 0; i < s1.length; i++) {
      const start = Math.max(0, i - match_window);
      const end = Math.min(i + match_window + 1, s2.length);
      
      for (let j = start; j < end; j++) {
        if (s2_matches[j] || s1[i] !== s2[j]) continue;
        s1_matches[i] = true;
        s2_matches[j] = true;
        matches++;
        break;
      }
    }
    
    if (matches === 0) return 0;
    
    // Find transpositions
    let k = 0;
    for (let i = 0; i < s1.length; i++) {
      if (!s1_matches[i]) continue;
      while (!s2_matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }
    
    return (matches / s1.length + matches / s2.length + (matches - transpositions / 2) / matches) / 3;
  }

  // Levenshtein similarity
  levenshteinSimilarity(str1, str2) {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;
    const distance = this.levenshteinDistance(str1, str2);
    return (maxLength - distance) / maxLength;
  }

  // Levenshtein distance calculation
  levenshteinDistance(str1, str2) {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  // Longest common subsequence
  longestCommonSubsequence(str1, str2) {
    const dp = Array(str1.length + 1).fill().map(() => Array(str2.length + 1).fill(0));
    
    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    return dp[str1.length][str2.length];
  }

  // Build full path for location display
  buildFullPath(location) {
    switch (location.type) {
      case 'municipality':
        return `${location.name}, ${location.district}, ${location.province}`;
      case 'district':
        return `${location.name}, ${location.province}`;
      case 'province':
        return location.name;
      default:
        return location.name;
    }
  }

  // Enhanced text highlighting with better match detection
  getHighlightedText(text, query) {
    if (!query) return text;
    
    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    
    // Find the best match position
    let bestMatch = { index: -1, length: 0 };
    
    // Try exact match first
    let index = normalizedText.indexOf(normalizedQuery);
    if (index !== -1) {
      bestMatch = { index, length: normalizedQuery.length };
    } else {
      // Try word boundary matches
      const words = normalizedText.split(/\s+/);
      let currentIndex = 0;
      
      for (const word of words) {
        if (word.startsWith(normalizedQuery)) {
          bestMatch = { index: currentIndex, length: normalizedQuery.length };
          break;
        }
        currentIndex += word.length + 1; // +1 for space
      }
    }
    
    if (bestMatch.index === -1) return text;
    
    return {
      before: text.substring(0, bestMatch.index),
      match: text.substring(bestMatch.index, bestMatch.index + bestMatch.length),
      after: text.substring(bestMatch.index + bestMatch.length)
    };
  }

  // Get smart suggestions based on partial input and context
  async getSmartSuggestions(query, userContext = {}) {
    await this.initialize();
    
    if (!query || query.length < 2) {
      // Return popular/common locations if no query
      return this.getPopularLocations();
    }

    const suggestions = await this.searchLocations(query);
    
    // Add context-based suggestions
    if (userContext.previousLocation) {
      const contextSuggestions = await this.getContextualSuggestions(query, userContext.previousLocation);
      suggestions.push(...contextSuggestions);
    }
    
    // Add autocomplete suggestions
    const autocompleteSuggestions = this.getAutocompleteSuggestions(query);
    suggestions.push(...autocompleteSuggestions);
    
    // Remove duplicates and sort
    const uniqueSuggestions = this.removeDuplicates(suggestions);
    return uniqueSuggestions.slice(0, 10);
  }

  // Get popular/commonly searched locations
  getPopularLocations() {
    const popularLocations = [
      'kathmandu', 'pokhara', 'chitwan', 'lalitpur', 'bhaktapur',
      'biratnagar', 'janakpur', 'nepalgunj', 'dharan', 'butwal'
    ];
    
    return popularLocations.map(location => ({
      id: location,
      name: this.formatLocationName(location),
      type: 'suggestion',
      score: 60,
      matchType: 'popular'
    }));
  }

  // Get contextual suggestions based on user's previous location
  async getContextualSuggestions(query, previousLocation) {
    const suggestions = [];
    
    // If user previously selected a province, suggest districts from that province
    if (previousLocation.province) {
      const districts = await this.getDistrictsByProvince(previousLocation.province);
      districts.forEach(district => {
        if (district.name.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            ...district,
            score: 80,
            matchType: 'contextual'
          });
        }
      });
    }
    
    return suggestions;
  }

  // Get autocomplete suggestions
  getAutocompleteSuggestions(query) {
    const suggestions = [];
    const normalizedQuery = this.normalizeText(query);
    
    // Common autocomplete patterns
    const patterns = [
      query + 'pur',
      query + 'nagar',
      query + 'ganj',
      query + 'kot',
      query + 'tol'
    ];
    
    patterns.forEach(pattern => {
      for (const [term, locations] of this.searchIndex.entries()) {
        if (term.startsWith(pattern.toLowerCase())) {
          locations.forEach(location => {
            suggestions.push({
              ...location,
              score: 40,
              matchType: 'autocomplete'
            });
          });
        }
      }
    });
    
    return suggestions;
  }

  // Remove duplicate suggestions
  removeDuplicates(suggestions) {
    const seen = new Set();
    return suggestions.filter(suggestion => {
      const key = `${suggestion.id}-${suggestion.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Format location name for display (capitalize words, handle special cases)
  formatLocationName(locationName) {
    if (!locationName) return '';
    
    return locationName
      .split(' ')
      .map(word => {
        // Handle special cases
        if (word === 'metropolitian') return 'Metropolitan';
        if (word === 'city') return 'City';
        if (word === 'municipality') return 'Municipality';
        if (word === 'pradesh-1') return 'Koshi';
        
        // Capitalize first letter
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  // Get the correct filename for a district (handles naming inconsistencies)
  getDistrictFilename(districtId) {
    if (!districtId) return '';
    
    // Clean the district ID (remove trailing spaces)
    const cleanDistrictId = districtId.trim().toLowerCase();
    
    // Handle special filename mappings
    const filenameMap = {
      'western rukum': 'western-rukum',
      'eastern rukum': 'eastern-rukum',
      'ilam': 'illam',
      'terhathum': 'tehrathum',
      'tanahun': 'tanahu'
    };
    
    // Return mapped filename or clean district ID
    return filenameMap[cleanDistrictId] || cleanDistrictId;
  }

  // Get all locations in flat array (optimized for search)
  async getAllLocationsFlat() {
    await this.initialize();
    return this.allLocationsFlat || [];
  }

  // Performance monitoring
  getPerformanceStats() {
    return {
      totalLocations: this.allLocationsFlat?.length || 0,
      indexSize: this.searchIndex.size,
      phoneticIndexSize: this.phoneticIndex.size,
      keywordIndexSize: this.locationKeywords.size,
      isLoaded: this.isLoaded
    };
  }

  // Clear cache (useful for development)
  clearCache() {
    this.districtsByProvince.clear();
    this.municipalsByDistrict.clear();
    this.searchIndex.clear();
    this.phoneticIndex.clear();
    this.locationKeywords.clear();
    this.allLocationsFlat = null;
    this.isLoaded = false;
  }
}

// Create singleton instance
const nepalLocationService = new NepalLocationService();

export default nepalLocationService;
