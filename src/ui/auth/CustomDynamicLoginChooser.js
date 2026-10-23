import { useState } from "react";
import { View } from "react-native";
import { ChevronDownIcon } from "lucide-react-native";
import { MenuView } from '@expo/ui/community/menu';
import firestore from '@react-native-firebase/firestore';

import { useGlobalAppContext } from "../../util/GlobalAppContext";
import { capitalizeWords } from "../../util/Utils";


// Chooser used to test bug reports directly in the app
function CustomDynamicLoginChooser({ setSelected }) {
  const { theme } = useGlobalAppContext();

  // Dynamically loaded documents
  const [documents, setDocuments] = useState({
    "functionality": [],
    "interface": [],
    "performance": [],
    "other": [],
  });
  async function loadDocuments(bugReportType) {
    console.log(`Loading documents from ${bugReportType}...`);
    firestore().collection("bugReports").where("type", "==", bugReportType).get()
      .then((querySnapshot) => {
        const documentsTemp = [];
        querySnapshot.forEach((doc) => {
          documentsTemp.push({ id: doc.id, title: doc.id });
        });

        // Functional update so we never overwrite a type loaded in the meantime with stale state
        setDocuments((previous) => ({ ...previous, [bugReportType]: documentsTemp }));
        console.log(`Loaded ${documentsTemp.length} documents from ${bugReportType}.`);
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  }

  // Build the menu tree, and remember what each action id should do.
  // (Firestore document ids are not used inside action ids, so any character in them is safe.)
  const handlers = new Map();
  const actions = Object.keys(documents).map((bugType) => {
    const loadId = `load:${bugType}`;
    handlers.set(loadId, () => loadDocuments(bugType));

    const documentActions = (documents[bugType] ?? []).map((doc, index) => {
      const id = `doc:${bugType}:${index}`;
      handlers.set(id, () => setSelected(doc.id));
      return { id, title: doc.title };
    });

    return {
      id: `type:${bugType}`,
      title: capitalizeWords(bugType),
      subactions: [
        ...documentActions,
        { id: loadId, title: "Load documents", image: "square.and.arrow.down" },
      ],
    };
  });

  return (
    <MenuView
      title="Select which bug report to load"
      actions={actions}
      onPressAction={({ nativeEvent }) => handlers.get(nativeEvent.event)?.()}
    >
      <View>
        <ChevronDownIcon size={25} color={theme.colors.onSurfaceDisabled}/>
      </View>
    </MenuView>
  );
}

export default CustomDynamicLoginChooser;