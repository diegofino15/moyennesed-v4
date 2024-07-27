import { Platform, Text, View } from "react-native";
import { ChevronRightIcon, Users2Icon, WrenchIcon, XIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";

import CustomTag from "../../../components/CustomTag";
import ColorsHandler from "../../../../core/ColorsHandler";
import { formatDate3, formatMark } from "../../../../util/Utils";
import { useAppContext } from "../../../../util/AppContext";


// Mark card
function MarkCard({ mark, subjectTitle, openMarkDetails, outline, windowWidth }) {
  if (!mark) { return; }

  const { theme } = useAppContext();

  // Get subject colors
  const { light, dark } = ColorsHandler.getSubjectColors(mark.subjectID);

  return (
    <PressableScale style={{
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: outline ? dark : theme.colors.surfaceOutline,
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
        <Text style={[theme.fonts.headlineMedium, {
          color: 'black',
          height: 25,
          top: Platform.select({ android: -2 }),
        }]}>{mark.valueStr ? mark.valueStr : "--"}</Text>

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
            <Text style={[theme.fonts.headlineSmall, {
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
        <Text style={[theme.fonts.bodyMedium, { alignItems: 'center' }]} numberOfLines={2}>
          {subjectTitle && <Text style={theme.fonts.labelMedium}>{subjectTitle} <ChevronRightIcon size={15} color={theme.colors.onSurfaceDisabled}/> </Text>}
          {mark.title}
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 20, height: 25 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.colors.backdrop,
              borderRadius: 5,
              paddingHorizontal: 8,
              paddingVertical: 1,
              borderWidth: 2,
              borderColor: theme.colors.surfaceOutline,
            }, mark.isCustomCoefficient && {
              borderColor: light,
              borderStyle: 'dashed',
              borderWidth: 1,
            }]}>
              <XIcon size={15} color={theme.colors.onSurfaceDisabled}/>
              <Text style={[theme.fonts.headlineSmall, {
                fontSize: 15,
                color: theme.colors.onSurfaceDisabled,
                fontFamily: "Numbers-Regular",
                top: Platform.select({ android: -2 }),
              }]}>{`${mark.coefficient}`.replace(".", ",")}</Text>
            </View>
            {mark.isCustomCoefficient && (
              <WrenchIcon size={15} color={dark} style={{
                marginLeft: 5,
              }}/>
            )}
          </View>
          {mark.classValue ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Users2Icon size={15} color={theme.colors.onSurfaceDisabled}/>
              <Text style={[theme.fonts.headlineSmall, {
                fontSize: 15,
                color: theme.colors.onSurfaceDisabled,
                fontFamily: "Numbers-Regular"
              }]}> : {formatMark(mark, true)}</Text>
            </View>
          ) : (
            <Text style={theme.fonts.labelMedium} numberOfLines={1}>{formatDate3(mark.date)}</Text>
          )}
        </View>
      </View>

      <ChevronRightIcon size={25} color={theme.colors.onSurfaceDisabled}/>

      {/* Is effective ? */}
      <CustomTag
        title={mark.isEffective ? "" : "Non significative"}
        style={mark.isEffective ? { paddingHorizontal: 0, paddingVertical: 0 } : {}}
        color={theme.colors.error}
        secondaryTag={mark.defaultIsEffective != mark.isEffective && (
          <WrenchIcon size={15} color={'white'}/>
        )}
        secondaryTagStyle={{
          paddingVertical: 5,
          paddingHorizontal: 5,
          backgroundColor: theme.colors.error,
        }}
      />
    </PressableScale>
  );
}

export default MarkCard;