import { Text, View } from "react-native";
import { Users2Icon } from "lucide-react-native";
import LineChart from 'react-native-simple-line-chart';

import { formatAverage, formatDate3 } from "../../util/Utils";
import { useAppContext } from "../../util/AppContext";


// Custom evolution chart
function CustomEvolutionChart({ listOfValues, showClassValues, color, lightColor, activeColor, height, windowWidth }) {
  const { theme } = useAppContext();
  
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
            <Text style={[theme.fonts.headlineSmall, {
              color: theme.colors.background,
              fontSize: 15,
            }]}>{point?.extraData?.formattedValue}</Text>
            <Text style={[theme.fonts.labelMedium, {
              color: theme.colors.background,
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
            <Users2Icon size={15} color={theme.colors.background}/>
            <Text style={[theme.fonts.headlineSmall, {
              color: theme.colors.background,
              fontSize: 15,
            }]}> : {point?.extraData?.formattedValue}</Text>
          </View>
        ),
      } : { data: [{x: 0, y: listOfValues?.at(0)?.value ?? 0}] }]}
      height={height}
      width={windowWidth}
    />
  );
}

export default CustomEvolutionChart;