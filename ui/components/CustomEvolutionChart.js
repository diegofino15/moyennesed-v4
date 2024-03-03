import { Text, View, Dimensions } from "react-native";
import { DefaultTheme } from "react-native-paper";
import LineChart from 'react-native-simple-line-chart';

import { formatAverage, formatDate3 } from "../../util/Utils";


// Custom evolution chart
function CustomEvolutionChart({ listOfValues, color, activeColor, height }) {
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
            padding: 10,
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
      }]}
      height={height}
      width={Dimensions.get('window').width - 20}
    />
  );
}

export default CustomEvolutionChart;