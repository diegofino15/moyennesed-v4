import { useState } from 'react';
import { View, TextInput, Dimensions } from 'react-native';
import { DefaultTheme } from 'react-native-paper';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { PressableScale } from 'react-native-pressable-scale';

import { OSvalue } from '../../util/Utils';


// Custom text input
function CustomTextInput({
  label,
  labelColor,
  icon,
  onChangeText,
  secureTextEntry,
  style,
  controller,
}) {
  const [showContent, setShowContent] = useState(!secureTextEntry);

  return (
    <View style={[{
      backgroundColor: DefaultTheme.colors.surface,
      borderWidth: 1,
      borderColor: DefaultTheme.colors.surfaceOutline,
      borderRadius: 10,
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
    }, style]}>
      {icon}
      <TextInput
        style={{
          ...DefaultTheme.fonts.bodyLarge,
          color: DefaultTheme.colors.onSurface,
          marginLeft: 10,
          width: Dimensions.get('window').width - 105,
          position: 'absolute',
          left: 40,
          height: 50,
          top: OSvalue({ iosValue: -3, androidValue: 0 }),
        }}
        placeholder={label}
        onChangeText={onChangeText}
        secureTextEntry={!showContent}
        placeholderTextColor={labelColor ? labelColor : DefaultTheme.colors.onSurfaceDisabled}
        autoCapitalize='none'
        autoCorrect={false}
        ref={controller}
      />
      {secureTextEntry && (
        <PressableScale onPress={() => setShowContent(!showContent)} style={{
          position: 'absolute',
          right: 15,
        }}>
          {showContent ? <EyeIcon size={20} color={DefaultTheme.colors.onSurface} /> : <EyeOffIcon size={20} color={DefaultTheme.colors.onSurface} />}
        </PressableScale>
      )}
    </View>
  );
}

export default CustomTextInput;