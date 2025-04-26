import React, {useEffect, useState, useCallback, memo} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';

const PRODUCT_API = 'https://pk9blqxffi.execute-api.us-east-1.amazonaws.com/xdeal/Xchange';
const PRODUCTS_PER_PAGE = 20;

const API_PARAMS = {
  categories: [],
  last_listing_id: '',
  last_row_value: '',
  max: PRODUCTS_PER_PAGE.toString(),
  min: '',
  search: '',
  sort: '',
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjYiLCJuYmYiOjE3NDU2MjYzNTksImV4cCI6MTc0ODIxODM1OSwiaXNzIjoiWHVyMzRQMSIsImF1ZCI6Ilh1cjQ0UFAifQ.qzc-LBSyxuBd7RqMtQFovUo093KtW3p7xHaYUPe0WJ8',
  user_type: 'Xpert',
  version_number: '2.2.6',
};

const numColumns = 2;
const CARD_MARGIN = 12;
const CARD_WIDTH = (Dimensions.get('window').width - CARD_MARGIN * 3) / numColumns;

function ProductCard({item}) {
  return (
    <View style={styles.card}>
      <Image
        source={{uri: item.item_image || 'https://via.placeholder.com/150'}}
        style={styles.productImage}
        resizeMode="cover"
      />
      <Text style={styles.productName} numberOfLines={2}>{item.model || 'Product Name'}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.currency}>{item.currency}</Text>
        <Text style={styles.productPrice}>
          {item.selling_price?.toFixed(2) || 'N/A'}
        </Text>
      </View>
      <Text style={styles.brand}>{item.brand}</Text>
    </View>
  );
}

function LoadingFooter({loading}) {
  if (!loading) return null;
  
  return (
    <View style={styles.loadingFooter}>
      <ActivityIndicator size="small" color="#007AFF" />
      <Text style={styles.loadingText}>Loading more products...</Text>
    </View>
  );
}

const BottomTabBar = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeTab, setActiveTab] = useState('home');

  const TabButton = ({icon, label, isActive, onPress}) => (
    <TouchableOpacity 
      style={[
        styles.tabButton,
        isActive && styles.tabButtonActive
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.tabIcon,
        isActive && styles.tabIconActive
      ]}>
        {icon}
      </Text>
      <Text style={[
        styles.tabLabel,
        isActive && styles.tabLabelActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[
      styles.bottomBar,
      {backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff'}
    ]}>
      <TabButton
        icon="🏠"
        label="Home"
        isActive={activeTab === 'home'}
        onPress={() => setActiveTab('home')}
      />
      <TabButton
        icon="🔍"
        label="Search"
        isActive={activeTab === 'search'}
        onPress={() => setActiveTab('search')}
      />
      <TabButton
        icon="❤️"
        label="Favorites"
        isActive={activeTab === 'favorites'}
        onPress={() => setActiveTab('favorites')}
      />
      <TabButton
        icon="👤"
        label="Profile"
        isActive={activeTab === 'profile'}
        onPress={() => setActiveTab('profile')}
      />
    </View>
  );
};

const Header = () => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.headerContainer}>
      <Text style={[
        styles.headerTitle,
        isDarkMode && styles.headerTitleDark
      ]}>
        Naughtas<Text style={styles.headerHighlight}>Cam</Text>
      </Text>
    </View>
  );
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastListingId, setLastListingId] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = async (lastId = '') => {
    try {
      const params = {
        ...API_PARAMS,
        last_listing_id: lastId,
      };

      console.log('Making API call with lastId:', lastId);
      const response = await axios.post(PRODUCT_API, params, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.data && response.data.xchange) {
        const newProducts = response.data.xchange;
        console.log('Received products:', newProducts.length);
        
        if (newProducts.length < PRODUCTS_PER_PAGE) {
          setHasMore(false);
        }
        
        if (lastId) {
          setProducts(prev => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }
        
        if (newProducts.length > 0) {
          setLastListingId(newProducts[newProducts.length - 1].listing_id.toString());
        }
      }
    } catch (e) {
      console.error('API Error:', e.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore || loading) return;
    
    setLoadingMore(true);
    fetchProducts(lastListingId);
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#181818' : '#f5f5f5',
    flex: 1,
  };

  const renderItem = useCallback(({item}) => <ProductCard item={item} />, []);
  const keyExtractor = useCallback(item => item.listing_id?.toString() || Math.random().toString(), []);
  const getItemLayout = useCallback((data, index) => (
    {length: CARD_WIDTH + CARD_MARGIN, offset: (CARD_WIDTH + CARD_MARGIN) * index, index}
  ), []);
  
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={{flex: 1}}>
        <Header />
        <View style={{flex: 1, paddingHorizontal: CARD_MARGIN, paddingTop: 16}}>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 40}} />
          ) : (
            <FlatList
              data={products}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              numColumns={numColumns}
              columnWrapperStyle={{justifyContent: 'space-between'}}
              contentContainerStyle={{paddingBottom: 80}}
              showsVerticalScrollIndicator={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={<LoadingFooter loading={loadingMore} />}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No products available</Text>
              }
              getItemLayout={getItemLayout}
              windowSize={5}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              removeClippedSubviews={true}
              initialNumToRender={10}
            />
          )}
        </View>
        <BottomTabBar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerTitleDark: {
    color: '#fff',
  },
  headerHighlight: {
    color: '#007AFF',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: CARD_MARGIN,
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  productImage: {
    width: CARD_WIDTH - 24,
    height: CARD_WIDTH - 24,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    minHeight: 44,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currency: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  brand: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loadingFooter: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    marginHorizontal: 8,
  },
  tabButtonActive: {
    borderRadius: 20,
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default App;
