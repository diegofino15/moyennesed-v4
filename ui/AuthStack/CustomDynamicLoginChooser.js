import { useState } from "react";
import { PressableScale } from "react-native-pressable-scale";
import { ChevronDownIcon } from "lucide-react-native";
import * as DropdownMenu from 'zeego/dropdown-menu'
import firestore from '@react-native-firebase/firestore';

import { useGlobalAppContext } from "../../src/util/GlobalAppContext";
import { capitalizeWords } from "../../src/util/Utils";


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

        setDocuments({ ...documents, [bugReportType]: documentsTemp });
        console.log(`Loaded ${documentsTemp.length} documents from ${bugReportType}.`);
      })
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <PressableScale>
          <ChevronDownIcon size={25} color={theme.colors.onSurfaceDisabled}/>
        </PressableScale>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Label>Select which bug report to load</DropdownMenu.Label>

        {/* Functionality */}
        {Object.keys(documents).map(bugType => (
          <DropdownMenu.Sub key={bugType}>
            <DropdownMenu.SubTrigger key={0}>{capitalizeWords(bugType)}</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent key={1}>
              {(documents[bugType] ?? []).map((doc, index) => (
                <DropdownMenu.Item key={`${index}-${bugType}`} onSelect={() => setSelected(doc.id)}>
                  <DropdownMenu.ItemTitle>{doc.title}</DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
              ))}

              <DropdownMenu.Item key={bugType} onSelect={() => loadDocuments(bugType)} shouldDismissMenuOnSelect={false}>
                <DropdownMenu.ItemIcon ios={{ name: "square.and.arrow.down" }}/>
                <DropdownMenu.ItemTitle>{"Load documents"}</DropdownMenu.ItemTitle>
              </DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export default CustomDynamicLoginChooser;