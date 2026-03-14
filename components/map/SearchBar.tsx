import { useState, useCallback } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';

interface SearchResult {
  place_id: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface SearchBarProps {
  onSelectLocation: (lat: number, lng: number) => void;
}

export function SearchBar({ onSelectLocation }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [focused, setFocused] = useState(false);

  // In production, this would call Google Places Autocomplete API
  // For now, clear results when query is empty
  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }
    // Placeholder: Google Places Autocomplete would go here
    // Results would populate setResults()
  }, []);

  const handleSelect = (result: SearchResult) => {
    onSelectLocation(result.latitude, result.longitude);
    setQuery(result.description);
    setResults([]);
    setFocused(false);
  };

  return (
    <View className="absolute top-14 left-4 right-4 z-10">
      <TextInput
        className="bg-dark-100 text-white px-4 py-3 rounded-xl text-base border border-dark-300"
        placeholder="Search location..."
        placeholderTextColor="#6B7280"
        value={query}
        onChangeText={handleSearch}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
      />
      {focused && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.place_id}
          className="bg-dark-100 mt-1 rounded-xl max-h-48"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              className="px-4 py-3 border-b border-dark-300"
            >
              <Text className="text-white text-sm">{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
