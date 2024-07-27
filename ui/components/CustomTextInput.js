import { useState } from 'react';
import { View, TextInput, Dimensions, Platform } from 'react-native';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { PressableScale } from 'react-native-pressable-scale';

import { useAppContext } from '../../util/AppContext';


// Custom text input
function CustomTextInput({
  label,
  labelColor,
  icon,
  iconOnRight=false,
  initialValue=null,
  onChangeText,
  secureTextEntry=false,
  style,
  textAreaStyle,
  controller,
}) {
  const { theme } = useAppContext();
  
  const [showContent, setShowContent] = useState(!secureTextEntry);

  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.surfaceOutline,
      borderRadius: 10,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      ...style,
    }}>
      {!iconOnRight && icon}
      <TextInput
        style={{
          ...theme.fonts.bodyLarge,
          color: theme.colors.onSurface,
          marginLeft: !iconOnRight ? 10 : 0,
          width: Dimensions.get('window').width - 105 - (iconOnRight ? 15 : 0),
          height: 50,
          top: Platform.select({ android: 2 }),
          ...textAreaStyle,
        }}
        placeholder={label}
        value={initialValue}
        onChangeText={onChangeText}
        secureTextEntry={!showContent}
        placeholderTextColor={labelColor ? labelColor : theme.colors.onSurfaceDisabled}
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
          {showContent ? <EyeIcon size={20} color={theme.colors.onSurface}/> : <EyeOffIcon size={20} color={theme.colors.onSurface}/>}
        </PressableScale>
      )}
    </View>
  );
}

export default CustomTextInput;