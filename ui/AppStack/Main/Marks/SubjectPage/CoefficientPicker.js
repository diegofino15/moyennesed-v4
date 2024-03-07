import { LinearGradient } from 'expo-linear-gradient';
import { XIcon } from 'lucide-react-native';
import { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Animated, Text } from 'react-native';
import { DefaultTheme } from 'react-native-paper';
import { PressableScale } from 'react-native-pressable-scale';


function CoefficientPicker({
  isModalVisible,
  setIsModalVisible,
  initialValue,
  setCoefficient,
}) {
  const [temporaryIsModalVisible, setTemporaryIsModalVisible] = useState(isModalVisible);
  useEffect(() => { setTemporaryIsModalVisible(isModalVisible) }, [isModalVisible]);
  useEffect(() => {
    if (!temporaryIsModalVisible && isModalVisible) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsModalVisible(false);
      });
    }
  }, [temporaryIsModalVisible])
  
  let animation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    animation.setValue(0);
    Animated.timing(animation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  // Possible coefficients
  const [possibleCoefficients, setPossibleCoefficients] = useState([]);
  useEffect(() => {
    const maxCoef = 25;
    const step = 0.5;
    setPossibleCoefficients([initialValue, ...[...Array(Math.floor(maxCoef/step) + 1).keys() ].map((i) => i * step)])
  }, []);

  // Selected
  const [selected, setSelected] = useState(0);

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 10 }]}>
      <Pressable onPress={() => {
        setCoefficient(possibleCoefficients[selected]);
        setTemporaryIsModalVisible(false);
      }} style={StyleSheet.absoluteFill}/>
      <View style={{
        position: 'absolute',
        right: 30,
        top: -45,
      }}>
        <Animated.View style={{
          height: 200,
          opacity: animation,
        }}>
          <View style={{
            width: 100,
            height: 45,
            backgroundColor: DefaultTheme.colors.surface,
            position: 'absolute',
            top: 70,
            right: 20,
          }}/>

          <View style={{
            width: 100,
            right: 0,
            height: 200,
            position: 'absolute',
            borderLeftWidth: 2,
            borderRightWidth: 2,
            borderColor: DefaultTheme.colors.surfaceOutline,
          }}>
            <LinearGradient colors={[
              'transparent',
              'black',
            ]} style={{ height: 100 }}/>
            <LinearGradient colors={[
              'black',
              'transparent',
            ]} style={{ height: 100 }}/>
          </View>

          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            snapToInterval={40}
            decelerationRate={0}
            onScroll={(event) => {
              setSelected(Math.floor((event.nativeEvent.contentOffset.y + 20) / 40));
            }} style={{
            height: 200,
          }}>
            <View style={{ height: 80 }}/>
            {possibleCoefficients.map((coef, index) => (
              <PressableScale key={index} style={{
                marginRight: 20,
                alignSelf: 'flex-end',
                height: 30,
                marginBottom: 10,
                backgroundColor: DefaultTheme.colors.surface,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: DefaultTheme.colors.surfaceOutline,
                flexDirection: 'row',
                alignItems: 'center',
                top: -2.5,
                right: -0.5,
                paddingHorizontal: 5,
              }} onPress={() => {
                setCoefficient(coef);
                setTemporaryIsModalVisible(false);
              }}>
                <XIcon size={15} color={DefaultTheme.colors.onSurfaceDisabled}/>
                <Text style={DefaultTheme.fonts.headlineMedium}>{`${coef}`.replace(".", ",")}</Text>
              </PressableScale>
            ))}
            <View style={{ height: 80 }}/>
          </Animated.ScrollView>
        </Animated.View>
      </View>
    </View>
  );
};

export default CoefficientPicker;
