import { Box, Text, useInput } from "ink";
import React, { useEffect, useState } from "react";
import {
  TranslateStateContents,
  translateState,
} from "../../lib/translate-state.js";

export const TranslationCommand: React.FC = () => {
  const [contents, setContents] = useState<TranslateStateContents>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    translateState.readAll().then((data) => {
      setContents(data);
      setIsLoading(false);
    });
  }, []);

  useInput((_input, key) => {
    if (key.upArrow) {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => Math.min(contents.length - 1, prev + 1));
    }
  });

  if (isLoading) {
    return (
      <Box borderStyle="classic" flexDirection="column" padding={1}>
        <Text>Loading translations...</Text>
      </Box>
    );
  }

  if (contents.length === 0) {
    return (
      <Box borderStyle="classic" flexDirection="column" padding={1}>
        <Text dimColor>No translation files found.</Text>
      </Box>
    );
  }

  const selectedContent = contents[selectedIndex];

  return (
    <Box borderStyle="classic" flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold>Translation Files ({contents.length})</Text>
      </Box>

      {/* File List */}
      <Box flexDirection="column" marginBottom={1}>
        {contents.map((item, index) => (
          <Box key={item.file_id}>
            <Text color={index === selectedIndex ? "cyan" : undefined}>
              {index === selectedIndex ? "▶ " : "  "}
              {item.file_id}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Selected File Content */}
      <Box borderStyle="single" flexDirection="column" paddingX={1}>
        <Box marginBottom={1}>
          <Text bold color="green">
            Content: {selectedContent.file_id}
          </Text>
        </Box>
        <Text>{selectedContent.content}</Text>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Use ↑/↓ to navigate</Text>
      </Box>
    </Box>
  );
};
