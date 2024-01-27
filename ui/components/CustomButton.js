import { useState } from 'react';
import { View, Text } from 'react-native';
import { PressableScale } from 'react-native-pressable-scale';

import HapticsHandler from '../../core/HapticsHandler';
import { DefaultTheme } from 'react-native-paper';


// Basic button
function CustomButton({ title, confirmTitle, confirmLabel, onPress, leftIcon, rightIcon, loadIcon, willLoad, overrideIsLoading, style, textStyle }) {
  const [isLoading, setIsLoading] = useState(overrideIsLoading);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  
  function onPressActive() {
    if (onPress && !isLoading) {
      if (confirmTitle && !waitingForConfirmation) {
        setWaitingForConfirmation(true);
        setTimeout(() => {
          setWaitingForConfirmation(false);
        }, 3000);
      } else {
        if (willLoad) {
          setIsLoading(true);
          onPress().then(() => {
            setIsLoading(false);
            HapticsHandler.vibrate("medium");
          });
        } else { onPress(); }
        setWaitingForConfirmation(false);
      }
      HapticsHandler.vibrate("medium");
    }
  }

  return (
    <PressableScale onPress={onPressActive}>
      <View style={[{
        backgroundColor: DefaultTheme.colors.primary,
        borderWidth: 1,
        borderColor: DefaultTheme.colors.background,
        paddingHorizontal: 20,
        paddingVertical: waitingForConfirmation && confirmLabel ? 12 : 20,
        borderRadius: 20,
        alignItems: isLoading && loadIcon ? 'center' : 'stretch'
      }, style]}>
        {(isLoading || overrideIsLoading) && loadIcon ? loadIcon : 
          <View style={{
            flexDirection: 'row',
            justifyContent: leftIcon || rightIcon ? 'space-between' : 'center',
            alignItems: 'center',
          }}>
            {leftIcon ? leftIcon : null}
            <View style={{
              alignItems: 'center'
            }}>
              <Text style={[
                DefaultTheme.fonts.bodyLarge,
                { color: DefaultTheme.colors.onPrimary },
                textStyle,
              ]}>
                {waitingForConfirmation ? confirmTitle : title}
              </Text>
              {waitingForConfirmation && confirmLabel ? <Text style={[DefaultTheme.fonts.labelSmall, { color: DefaultTheme.colors.onPrimary }, textStyle]}>{confirmLabel}</Text> : null}
            </View>
            {rightIcon ? rightIcon : null}
          </View>
        }
      </View>
    </PressableScale>
  );
}

export default CustomButton;