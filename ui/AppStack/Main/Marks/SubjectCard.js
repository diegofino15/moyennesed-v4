import { Dimensions, FlatList, Text, View } from "react-native";
import { CornerDownRightIcon } from "lucide-react-native";
import { PressableScale } from "react-native-pressable-scale";
import { DefaultTheme } from "react-native-paper";

import { formatAverage, formatMark } from "../../../../util/Utils";
import ColorsHandler from "../../../../util/ColorsHandler";


// Embedded subject card
function EmbeddedSubjectCard({ accountID, subject, getMark, navigation }) {
  const { light, dark } = ColorsHandler.getSubjectColors(subject.id)
  
  // Open subject page
  function openSubjectPage() {
    navigation.navigate("SubjectStack", {
      accountID,
      subject: subject,
      subSubjectID: subject.subID,
    });
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {subject.subID && (
        <CornerDownRightIcon
          size={40}
          color={DefaultTheme.colors.onSurfaceDisabled}
          style={{ marginRight: 5 }}
        />
      )}

      <PressableScale style={{
        backgroundColor: light,
        borderRadius: 10,
        marginVertical: 5,
        width: Dimensions.get('window').width - (subject.subID ? 85 : 40),
      }} onPress={openSubjectPage}>
        <View style={{
          backgroundColor: dark,
          borderRadius: 10,
          paddingHorizontal: 15,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',

          shadowOpacity: 0.5,
          shadowOffset: { width: 0, height: 0 },
        }}>
          <Text style={[DefaultTheme.fonts.bodyLarge, {
            color: 'black',
            width: Dimensions.get('window').width - (subject.subID ? 195 : 150),
          }]} numberOfLines={1}>{subject.title}</Text>
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
          }}>
            <Text style={[DefaultTheme.fonts.headlineMedium, { color: 'black' }]}>{formatAverage(subject.average)}</Text>
            {subject.average && <Text style={[DefaultTheme.fonts.labelSmall, { color: 'black', fontFamily: "Numbers-Regular" }]}>/20</Text>}
          </View>
        </View>
        
        {!Object.keys(subject.subSubjects).length && subject.marks.length ? (
          <View style={{
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 10,
          }}>
            <FlatList
              horizontal
              scrollEnabled={false}
              data={subject.sortedMarks}
              renderItem={({ item }) => {
                const mark = getMark(item);
                return (
                  <Text style={[DefaultTheme.fonts.headlineMedium, {
                    color: 'black',
                    opacity: mark.isEffective ? 1 : 0.2,
                    fontFamily: "Numbers-Regular",
                  }]}>{formatMark(mark)}</Text>
                );
              }}
              ItemSeparatorComponent={<View style={{ width: 12.5 }}/>} 
            />
          </View>
        ) : null}
      </PressableScale>
    </View>
  );
}

// Main subject card
function SubjectCard({ accountID, subject, getMark, navigation }) {
  return (
    <View>
      <EmbeddedSubjectCard
        accountID={accountID}
        subject={subject}
        getMark={getMark}
        navigation={navigation}
      />

      {/* Sub subjects */}
      {Object.values(subject.subSubjects).map((subSubject, index) => (
        <EmbeddedSubjectCard
          key={index}
          accountID={accountID}
          subject={subSubject}
          getMark={getMark}
          navigation={navigation}
        />
      ))}
    </View>
  );
}

export default SubjectCard;