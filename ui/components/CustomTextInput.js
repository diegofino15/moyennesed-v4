import { useState } from 'react';
import { View, TextInput, Dimensions } from 'react-native';
import { DefaultTheme } from 'react-native-paper';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { PressableScale } from 'react-native-pressable-scale';


// Custom text input
function CustomTextInput({
  label,
  labelColor,
  icon,
  iconOnRight=false,
  initialValue=null,
  onChangeText,
  secureTextEntry,
  style,
  textAreaStyle,
  controller,
}) {
  const [showContent, setShowContent] = useState(!secureTextEntry);

  return (
    <View style={{
      backgroundColor: DefaultTheme.colors.surface,
      borderWidth: 1,
      borderColor: DefaultTheme.colors.surfaceOutline,
      borderRadius: 10,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      ...style,
    }}>
      {!iconOnRight && icon}
      <TextInput
        style={{
          ...DefaultTheme.fonts.bodyLarge,
          color: DefaultTheme.colors.onSurface,
          marginLeft: !iconOnRight ? 10 : 0,
          width: Dimensions.get('window').width - 105 - (iconOnRight ? 15 : 0),
          height: 50,
          ...textAreaStyle,
        }}
        placeholder={label}
        value={initialValue}
        onChangeText={onChangeText}
        secureTextEntry={!showContent}
        placeholderTextColor={labelColor ? labelColor : DefaultTheme.colors.onSurfaceDisabled}
        autoCapitalize='none'
        autoCorrect={false}
        ref={controller}
      />
      {iconOnRight && icon}
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