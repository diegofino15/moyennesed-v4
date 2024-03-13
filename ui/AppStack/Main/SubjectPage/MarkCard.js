import { useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { ChevronRightIcon, Users2Icon } from "lucide-react-native";
import { DefaultTheme } from "react-native-paper";
import { PressableScale } from "react-native-pressable-scale";

import CustomTag from "../../../components/CustomTag";
import ColorsHandler from "../../../../util/ColorsHandler";
import { formatDate2, formatDate3, formatMark } from "../../../../util/Utils";


// Mark card
function MarkCard({ mark, subjectTitle, openMarkDetails, outline }) {
  if (!mark) { return; }

  const { light, dark } = ColorsHandler.getSubjectColors(mark.subjectID);

  // Alternate class value / coefficient
  const [showCoefficient, setShowCoefficient] = useState(false);

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
        <Text style={[DefaultTheme.fonts.headlineMedium, { color: 'black' }]}>{mark.valueStr}</Text>

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
            <Text style={[DefaultTheme.fonts.headlineSmall, { color: 'black', fontSize: 15 }]}>/{mark.valueOn}</Text>
          </View>
        )}
      </View>

      {/* Mark details */}
      <View style={{
        justifyContent: 'space-evenly',
        width: Dimensions.get('window').width - 160,
      }}>
        <Text style={[DefaultTheme.fonts.bodyMedium, { alignItems: 'center' }]} numberOfLines={2}>
          {subjectTitle && <Text style={DefaultTheme.fonts.labelMedium}>{subjectTitle} <ChevronRightIcon size={15} color={DefaultTheme.colors.onSurfaceDisabled}/> </Text>}
          {mark.title}
        </Text>
        
        {mark.classValue ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingRight: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Users2Icon size={15} color={DefaultTheme.colors.onSurfaceDisabled}/>
              <Text style={[DefaultTheme.fonts.headlineSmall, {
                fontSize: 15,
                color: DefaultTheme.colors.onSurfaceDisabled,
                fontFamily: "Numbers-Regular"
              }]}> : {formatMark(mark, true)}</Text>
            </View>
            <Text style={DefaultTheme.fonts.labelMedium} numberOfLines={1}>-   {formatDate3(mark.date)}</Text>
          </View>
        ) : (
          <Text style={DefaultTheme.fonts.labelMedium} numberOfLines={1}>{formatDate2(mark.date)}</Text>
        )}
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