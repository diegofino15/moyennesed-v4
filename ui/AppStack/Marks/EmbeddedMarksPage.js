import { useEffect, useState } from "react";
import { View } from "react-native";
import MarksOverview from "./MarksOverview";


// Embedded mark page
function EmbeddedMarksPage() {
  // Selected period
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  
  return (
    <View>
      <MarksOverview
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />
    </View>
  );
}

export default EmbeddedMarksPage;