import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { MapPin, Search } from 'lucide-react-native';
import api from '../services/api';
import { useTheme } from '../theme/colors';

interface Suggestion {
  formatted: string;
  lat: number;
  lon: number;
  name: string;
}

interface Props {
  placeholder: string;
  onSelect: (suggestion: Suggestion) => void;
  iconColor: string;
}

const PlaceAutocomplete = ({ placeholder, onSelect, iconColor }: Props) => {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const response = await api.post('/autocomplete', { address: query });
          setSuggestions(response.data.payload || []);
          setShowDropdown(true);
        } catch (err) {
          console.error('Autocomplete error:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: Suggestion) => {
    setQuery(item.formatted);
    setShowDropdown(false);
    onSelect(item);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <MapPin size={20} color={iconColor} strokeWidth={2.5} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onFocus={() => query.length > 2 && setShowDropdown(true)}
        />
        {loading && <ActivityIndicator size="small" color={colors.primary} />}
      </View>

      {showDropdown && suggestions.length > 0 && (
        <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.suggestionItem, { borderBottomColor: colors.border }]} 
                onPress={() => handleSelect(item)}
              >
                <Search size={16} color={colors.textMuted} style={{ marginRight: 12 }} />
                <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={2}>
                  {item.formatted}
                </Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 20,
    gap: 14,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 8,
    borderRadius: 20,
    borderWidth: 1,
    maxHeight: 250,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});

export default PlaceAutocomplete;
