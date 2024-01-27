import { View, TextInput, Dimensions } from 'react-native';
import { DefaultTheme } from 'react-native-paper';


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
        }}
        placeholder={label}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={labelColor ? labelColor : DefaultTheme.colors.onSurfaceDisabled}
        autoCapitalize='none'
        autoCorrect={false}
        ref={controller}
      />
    </View>
  );
}

export default CustomTextInput;