import { Text, View, Dimensions } from "react-native";
import { DefaultTheme } from "react-native-paper";
import LineChart from 'react-native-simple-line-chart';

import { formatAverage, formatDate3 } from "../../util/Utils";
import { Users2Icon } from "lucide-react-native";


// Custom evolution chart
function CustomEvolutionChart({ listOfValues, showClassValues, color, lightColor, activeColor, height }) {
  return (
    <LineChart
      lines={[{
        data: listOfValues?.map((average, index) => {
          return {
            x: index,
            y: average.value,
            extraData: {
              formattedValue: formatAverage(average.value),
              formattedDate: formatDate3(average.date),
            },
          };
        }),
        activePointConfig: {
          color: activeColor,
          showVerticalLine: true,
        },
        lineColor: color,
        curve: 'linear',
        endPointConfig: {
          color: activeColor,
          radius: 5,
          animated: true,
        },
        activePointComponent: (point) => (
          <View style={{
            backgroundColor: color,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
          }}>
            <Text style={[DefaultTheme.fonts.headlineSmall, {
              color: 'black',
              fontSize: 15,
            }]}>{point?.extraData?.formattedValue}</Text>
            <Text style={[DefaultTheme.fonts.labelMedium, {
              color: 'black',
              fontSize: 13,
            }]}>{point?.extraData?.formattedDate}</Text>
          </View>
        ),
      }, showClassValues ? {
        data: listOfValues?.map((average, index) => {
          return {
            x: index,
            y: average.classValue,
            extraData: {
              formattedValue: formatAverage(average.classValue),
            },
          };
        }),
        lineColor: lightColor,
        curve: 'linear',
        lineWidth: 0.5,
        trailingOpacity: 0.1,
        endPointConfig: {
          color: lightColor,
          radius: 2,
        },
        activePointConfig: {
          color: lightColor,
          showVerticalLine: false,
          radius: 2,
        },
        activePointComponent: (point) => (
          <View style={{
            backgroundColor: lightColor,
            paddingHorizontal: 5,
            paddingVertical: 3,
            borderRadius: 5,
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 5,
          }}>
            <Users2Icon size={15} color="black"/>
            <Text style={[DefaultTheme.fonts.headlineSmall, {
              color: 'black',
              fontSize: 15,
            }]}> : {point?.extraData?.formattedValue}</Text>
          </View>
        ),
      } : { data: [{x: 0, y: listOfValues?.at(0)?.value ?? 0}] }]}
      height={height}
      width={Dimensions.get('window').width - 20}
    />
  );
}

export default CustomEvolutionChart;