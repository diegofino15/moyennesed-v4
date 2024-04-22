import { Platform, Text, View } from "react-native";
import { ChevronRightIcon, Users2Icon, XIcon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";

import CustomTag from "../../../components/CustomTag";
import ColorsHandler from "../../../../core/ColorsHandler";
import { formatDate3, formatMark } from "../../../../util/Utils";

// Mark card
function MarkCard({ mark, subjectTitle, openMarkDetails, outline, windowWidth }) {
  if (!mark) { return; }

  // Get subject colors
  const { light, dark } = ColorsHandler.getSubjectColors(mark.subjectID);

  return (
    <PressableScale style={{
      backgroundColor: DefaultTheme.colors.surface,
      borderWidth: 2,
      borderColor: outline ? dark : DefaultTheme.colors.surfaceOutline,
      borderRadius: 10,
      marginVertical: 5,
      marginTop: mark.isEffective ? 5 : 10,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
    }} onPress={openMarkDetails}>
      {/* Mark value */}
      <View style={{
        backgroundColor: light,
        width: 60,
        height: 60,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
      }}>
        <Text style={[DefaultTheme.fonts.headlineMedium, {
          color: 'black',
          height: 25,
          top: Platform.select({ android: -2 }),
        }]}>{mark.valueStr}</Text>

        {mark.valueOn != 20 && (
          <View style={{
            position: 'absolute',
            right: -5,
            bottom: -5,
            paddingVertical: 2,
            paddingHorizontal: 5,
            borderRadius: 5,
            backgroundColor: dark ?? 'black',
            shadowOpacity: 0.5,
            shadowOffset: { width: 0, height: 0 },
          }}>
            <Text style={[DefaultTheme.fonts.headlineSmall, {
              color: 'black',
              fontSize: 15,
              height: 18,
              top: Platform.select({ android: -2 }),
            }]}>/{mark.valueOn}</Text>
          </View>
        )}
      </View>

      {/* Mark details */}
      <View style={{
        justifyContent: 'space-evenly',
        width: windowWidth - 160,
      }}>
        <Text style={[DefaultTheme.fonts.bodyMedium, { alignItems: 'center' }]} numberOfLines={2}>
          {subjectTitle && <Text style={DefaultTheme.fonts.labelMedium}>{subjectTitle} <ChevronRightIcon size={15} color={DefaultTheme.colors.onSurfaceDisabled}/> </Text>}
          {mark.title}
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 20, height: 25 }}>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: DefaultTheme.colors.backdrop,
            borderRadius: 5,
            paddingHorizontal: 8,
            paddingVertical: 1,
            borderWidth: 2,
            borderColor: DefaultTheme.colors.surfaceOutline,
          }}>
            <XIcon size={15} color={DefaultTheme.colors.onSurfaceDisabled}/>
            <Text style={[DefaultTheme.fonts.headlineSmall, {
              fontSize: 15,
              color: DefaultTheme.colors.onSurfaceDisabled,
              fontFamily: "Numbers-Regular",
              top: Platform.select({ android: -2 }),
            }]}>{`${mark.coefficient}`.replace(".", ",")}</Text>
          </View>
          {mark.classValue ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Users2Icon size={15} color={DefaultTheme.colors.onSurfaceDisabled}/>
              <Text style={[DefaultTheme.fonts.headlineSmall, {
                fontSize: 15,
                color: DefaultTheme.colors.onSurfaceDisabled,
                fontFamily: "Numbers-Regular"
              }]}> : {formatMark(mark, true)}</Text>
            </View>
          ) : (
            <Text style={DefaultTheme.fonts.labelMedium} numberOfLines={1}>{formatDate3(mark.date)}</Text>
          )}
        </View>
      </View>

      <ChevronRightIcon size={25} color={DefaultTheme.colors.onSurfaceDisabled}/>

      {/* Is effective ? */}
      {!mark.isEffective && (
        <CustomTag
          title={"Non significative"}
          color={DefaultTheme.colors.error}
        />
      )}
    </PressableScale>
  );
}

export default MarkCard;