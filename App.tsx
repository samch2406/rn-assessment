/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Keyboard,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {GOOGLE_MAP_ID} from './src/constants/api.constant';
import {useAppDispatch, useAppSelector} from './src/hooks';
import {
  setAutoCompleteApiRes,
  setRecentSearch,
} from './src/reducers/common.slice';
import {
  getAutoCompleteAction,
  getPlaceDetailsAction,
} from './src/sagas/common.saga';

interface DataOption {
  label: string;
  value: string;
}

interface Marker {
  latitude: number;
  longitude: number;
}

const App = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const autoCompleteData = useAppSelector(
    state => state.common.autoCompleteApiRes,
  );
  const placeDetails = useAppSelector(state => state.common.placeDetailsApiRes);

  const recentSearch = useAppSelector(state => state.common.recentSearch);

  const [input, setInput] = useState('');
  const [dataOption, setDataOption] = useState<Array<DataOption>>([]);
  const [showDataOption, setShowDataOption] = useState(false);
  const [inputOnFocus, setInputOnFocus] = useState(false);
  const [marker, setMarker] = useState<Marker | null>(null);
  const isDarkMode = useColorScheme() === 'dark';
  const mapRef = useRef<MapView>(null);

  const styles = useStyles(inputOnFocus);
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    if (input !== '') {
      dispatch(getAutoCompleteAction(input));
    } else {
      dispatch(setAutoCompleteApiRes([]));
    }
  }, [input]);

  useEffect(() => {
    if (autoCompleteData && autoCompleteData.length > 0) {
      const autoCompleteOption: Array<DataOption> = autoCompleteData.map(
        (place: any) => {
          return {label: place.description, value: place.place_id};
        },
      );
      setDataOption(autoCompleteOption);
    } else if (recentSearch && recentSearch.length > 0) {
      setDataOption(recentSearch);
    } else {
      setDataOption([]);
    }
  }, [autoCompleteData, recentSearch]);

  useEffect(() => {
    if (placeDetails && placeDetails?.geometry) {
      const tempCoor = {
        latitude: placeDetails?.geometry?.location.lat,
        longitude: placeDetails?.geometry?.location.lng,
      };
      setMarker(tempCoor);
      moveToMarker(placeDetails?.geometry.viewport);
    }
  }, [placeDetails]);

  const onSelectPlace = (place: DataOption) => {
    Keyboard.dismiss();
    setShowDataOption(false);
    setInput(place.label);
    setMarker(null);
    dispatch(getPlaceDetailsAction(place.value));
    const existedInRecent = recentSearch.find(
      (r: DataOption) => r.value === place.value,
    );
    if (!existedInRecent) {
      dispatch(setRecentSearch([place, ...recentSearch]));
    }
  };

  const moveToMarker = (geometryViewPort: any) => {
    const {northeast, southwest} = geometryViewPort;

    const latitudeDelta = northeast.lat - southwest.lat;
    const longitudeDelta = northeast.lng - southwest.lng;

    const region: Region = {
      latitude: (northeast.lat + southwest.lat) / 2,
      longitude: (northeast.lng + southwest.lng) / 2,
      latitudeDelta,
      longitudeDelta,
    };

    mapRef.current?.animateToRegion(region, 600);
  };

  const renderOption = ({item, index}: any) => {
    return (
      <TouchableOpacity
        style={styles.optionStyle}
        key={index}
        onPress={() => onSelectPlace(item)}>
        <Text style={styles.optionText}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  const divider = () => {
    return <View style={styles.divider} />;
  };

  return (
    <SafeAreaView style={styles.areaView}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        googleMapId={GOOGLE_MAP_ID}
        customMapStyle={[]}
        style={styles.mapStyle}
        initialRegion={{
          latitude: 3.6305816393328616,
          longitude: 102.57744135741954,
          latitudeDelta: 0.169042,
          longitudeDelta: 25.92998,
        }}>
        {marker && <Marker id={'abcd123'} coordinate={marker} />}
      </MapView>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputStyle}
            value={input}
            onChangeText={setInput}
            placeholder={'Search'}
            onFocus={() => {
              setInputOnFocus(true);
              setShowDataOption(true);
            }}
            onBlur={() => {
              setInputOnFocus(false);
              setShowDataOption(false);
            }}
          />
          {inputOnFocus && input !== '' && (
            <TouchableOpacity
              style={styles.clearIcon}
              onPress={() => setInput('')}>
              <Text>{'X'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {showDataOption && dataOption.length > 0 && (
          <FlatList
            keyboardShouldPersistTaps={'always'}
            data={dataOption}
            keyExtractor={item => item.value}
            style={styles.autoCompleteStyle}
            renderItem={renderOption}
            ItemSeparatorComponent={divider}
            ListHeaderComponent={
              autoCompleteData.length === 0 ? (
                <Text style={styles.optionHeader}>{'Recent Search'}</Text>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const useStyles = (inputFocus: boolean) =>
  StyleSheet.create({
    areaView: {
      flex: 1,
    },
    mapStyle: {
      ...StyleSheet.absoluteFillObject,
    },
    content: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      alignContent: 'center',
      alignSelf: 'center',
      marginTop: 80,
      width: '100%',
      zIndex: 100,
    },
    inputContainer: {
      width: '90%',
      flexDirection: 'row',
      alignItems: 'center',
      alignContent: 'center',
      alignSelf: 'center',
    },
    inputStyle: {
      borderWidth: 1,
      borderColor: 'skyblue',
      backgroundColor: 'white',
      borderRadius: 5,
      width: '100%',
      height: 40,
      paddingLeft: 10,
      paddingRight: inputFocus ? 35 : 10,
    },
    clearIcon: {
      opacity: 0.5,
      backgroundColor: 'lightgrey',
      borderRadius: 5,
      position: 'absolute',
      right: 0,
      width: 20,
      alignItems: 'center',
      alignContent: 'center',
      alignSelf: 'center',
      marginRight: 10,
    },
    autoCompleteStyle: {
      marginTop: 10,
      width: '90%',
      borderRadius: 5,
      backgroundColor: 'white',
    },
    optionStyle: {
      paddingHorizontal: 15,
      paddingVertical: 10,
    },
    optionHeader: {
      fontWeight: 'bold',
      color: 'grey',
      marginHorizontal: 15,
      marginVertical: 10,
      fontSize: 12,
    },
    optionText: {
      width: '100%',
    },
    divider: {
      borderBottomColor: 'grey',
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
  });

export default App;
