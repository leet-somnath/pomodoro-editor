import { useState, useEffect } from "react";

export default function PomodoroEditor() {
  const [timeLeft, setTimeLeft] = useState(60);
  const [minutes, setMinutes] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editingTabIndex, setEditingTabIndex] = useState(null);
  const [editingTabName, setEditingTabName] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [tabs, setTabs] = useState([
    {
      name: "Main.java",
      content: `// Java DSA Practice Template
public class Main {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello World");
        
        // Example array
        int[] arr = {5, 3, 8, 4, 2};
        System.out.println("Array: " + java.util.Arrays.toString(arr));
    }
}`
    }
  ]);

  // Theme colors based on current mode
  const theme = {
    bg: isDarkMode ? "#0d1b2a" : "#f8fafc",
    headerBg: isDarkMode ? "#1e293b" : "#e2e8f0",
    text: isDarkMode ? "#e0e1dd" : "#334155",
    lineNumbers: isDarkMode ? "#64748b" : "#94a3b8",
    border: isDarkMode ? "#334155" : "#cbd5e1",
    titleGradient: isDarkMode
      ? "linear-gradient(90deg, #3a1c71, #6b46c1)"
      : "linear-gradient(90deg, #6366f1, #8b5cf6)",
    activeTabBg: isDarkMode ? "#0d1b2a" : "#ffffff",
    inactiveTabText: isDarkMode ? "#94a3b8" : "#64748b"
  };

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      alert("Time's up!");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Handle tab key
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newContent = tabs[activeTab].content.substring(0, selectionStart) + '    ' + tabs[activeTab].content.substring(selectionEnd);

      const newTabs = [...tabs];
      newTabs[activeTab].content = newContent;
      setTabs(newTabs);

      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 4;
      }, 0);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle dark/light mode
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle timer controls
  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(minutes * 60);
  };

  // Handle minutes input change
  const handleMinutesChange = (e) => {
    const value = Math.max(1, Math.min(60, parseInt(e.target.value) || 0));
    setMinutes(value);
    setTimeLeft(value * 60);
  };

  // Update tab content
  const updateTabContent = (e) => {
    const newTabs = [...tabs];
    newTabs[activeTab].content = e.target.value;
    setTabs(newTabs);
  };

  // Get simplified boilerplate code based on file extension
  const getBoilerplateForExtension = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const baseName = filename.split('.')[0]; // Get only the first part before dot (fixed)

    switch (extension) {
      case 'java':
        return `// Java DSA Practice Template
public class ${baseName} {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello World");
        
        // Example array
        int[] arr = {5, 3, 8, 4, 2};
        System.out.println("Array: " + java.util.Arrays.toString(arr));
    }
}`;
      case 'py':
        return `# Python DSA Practice Template

def main():
    # Your code here
    print("Hello World")
    
    # Example array
    arr = []
    print(f"Array: {arr}")

if __name__ == "__main__":
    main()`;
      case 'c':
        return `#include <stdio.h>

int main() {
    // Your code here
    printf("Hello World\\n");
    
    // Example array
    int arr[] = {5, 3, 8, 4, 2};
    int n = sizeof(arr) / sizeof(arr[0]);
    
    printf("Array: ");
    for (int i = 0; i < n; i++)
        printf("%d ", arr[i]);
    printf("\\n");
    
    return 0;
}`;
      case 'cpp':
        return `#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Your code here
    cout << "Hello World" << endl;
    
    // Example array
    vector<int> arr = {5, 3, 8, 4, 2};
    cout << "Array: ";
    for (int num : arr) cout << num << " ";
    cout << endl;
    
    return 0;
}`;
      case 'js':
        return `// JavaScript DSA Practice Template

function main() {
    // Your code here
    console.log("Hello World");
    
    // Example array
    const arr = [];
    console.log("Array:", arr);
}

main();`;
      default:
        return `// New file: ${filename}
// Add your code here`;
    }
  };

  // Add new tab with default name
  const addGenericTab = () => {
    const newTabName = `File${tabs.length + 1}.txt`;
    setTabs([...tabs, {
      name: newTabName,
      content: `// New file: ${newTabName}\n// Add your code here`
    }]);
    setActiveTab(tabs.length);
  };

  // Add new tab with specific language
  const addLanguageTab = (lang) => {
    const extensions = {
      'java': 'java',
      'python': 'py',
      'c': 'c',
      'cpp': 'cpp',
      'javascript': 'js'
    };

    const extension = extensions[lang] || 'txt';
    const baseName = `File${tabs.length + 1}`;
    const newTabName = `${baseName}.${extension}`;

    const newTabs = [...tabs, {
      name: newTabName,
      content: getBoilerplateForExtension(newTabName)
    }];

    setTabs(newTabs);
    setActiveTab(newTabs.length - 1);
  };

  // Close tab
  const closeTab = (index, e) => {
    e.stopPropagation();
    if (tabs.length === 1) return;

    const newTabs = tabs.filter((_, i) => i !== index);
    setTabs(newTabs);

    if (activeTab >= index && activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  // Start renaming tab
  const startRenaming = (index, e) => {
    e.stopPropagation();
    setEditingTabIndex(index);
    setEditingTabName(tabs[index].name);
  };

  // FIXED: Update class name in Java files based on the file name
  const updateClassNameInContent = (oldName, newName, content) => {
    // Only process Java files
    if (!newName.endsWith('.java')) return content;

    // Extract just the filename without extension
    const oldClassName = oldName.split('.')[0]; // FIXED: Get only the first part (filename without extension)
    const newClassName = newName.split('.')[0]; // FIXED: Get only the first part (filename without extension)

    // Replace all occurrences of the class name in the content
    return content.replace(
      new RegExp(`class\\s+${oldClassName}\\s*\\{`, 'g'),
      `class ${newClassName} {`
    );
  };

  // Save tab rename with class name update
  const saveTabRename = (e) => {
    e.preventDefault();

    if (editingTabName.trim() === '') {
      return; // Don't allow empty names
    }

    const oldName = tabs[editingTabIndex].name;
    const newName = editingTabName;

    const newTabs = [...tabs];
    newTabs[editingTabIndex].name = newName;

    // Update class name in content if it's a Java file
    if (oldName.endsWith('.java') && newName.endsWith('.java')) {
      newTabs[editingTabIndex].content = updateClassNameInContent(
        oldName,
        newName,
        newTabs[editingTabIndex].content
      );
    }

    setTabs(newTabs);
    setEditingTabIndex(null);
  };

  // Handle tab rename input
  const handleTabRenameChange = (e) => {
    setEditingTabName(e.target.value);
  };

  // Handle tab rename key press
  const handleTabRenameKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveTabRename(e);
    } else if (e.key === 'Escape') {
      setEditingTabIndex(null);
    }
  };

  // Copy current tab content
  const saveCode = () => {
    navigator.clipboard.writeText(tabs[activeTab].content);
    alert("Code copied to clipboard!");
  };

  // Calculate line numbers for current tab
  const getLineNumbers = () => {
    const lines = tabs[activeTab].content.split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1).join('\n');
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      fontFamily: "Consolas, Monaco, 'Courier New', monospace",
      backgroundColor: theme.bg,
      color: theme.text,
      transition: "all 0.3s ease"
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        backgroundColor: theme.headerBg,
        borderBottom: `1px solid ${theme.border}`,
        padding: "10px 15px",
        alignItems: "center",
        transition: "all 0.3s ease"
      }}>
        {/* Title */}
        <div style={{
          background: theme.titleGradient,
          padding: "8px 16px",
          borderRadius: "6px",
          marginBottom: "10px", // Add margin for mobile view
          transition: "all 0.3s ease"
        }}>
          <h1 style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: "600",
            color: "white"
          }}>
            Practice DSA - sombhai
          </h1>
        </div>

        {/* Timer Section */}
        <div style={{
          display: "flex",
          alignItems: "center",
          background: theme.titleGradient,
          padding: "6px 16px",
          borderRadius: "6px",
          marginBottom: "10px", // Add margin for mobile view
          transition: "all 0.3s ease"
        }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", marginRight: "12px", color: "white" }}>
            {formatTime(timeLeft)}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={isActive ? pauseTimer : startTimer}
              style={{
                backgroundColor: isActive ? "#ef4444" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "4px 10px",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              {isActive ? "Pause" : "Start"}
            </button>
            <button
              onClick={resetTimer}
              style={{
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "4px 10px",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <input
            type="number"
            min="1"
            max="60"
            value={minutes}
            onChange={handleMinutesChange}
            style={{
              width: "50px",
              padding: "5px",
              backgroundColor: isDarkMode ? "#334155" : "#e2e8f0",
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: "4px",
              fontSize: "14px",
              transition: "all 0.3s ease"
            }}
          />
          <span>mins</span>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              backgroundColor: "transparent",
              color: theme.text,
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              padding: "4px 8px",
              transition: "all 0.3s ease"
            }}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>

          <button
            onClick={saveCode}
            style={{
              backgroundColor: "transparent",
              color: theme.text,
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              padding: "4px 8px",
              transition: "all 0.3s ease"
            }}
            title="Copy code"
          >
            💾
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: "flex",
        backgroundColor: theme.headerBg,
        borderBottom: `1px solid ${theme.border}`,
        padding: "0 10px",
        overflowX: "auto",
        whiteSpace: "nowrap",
        transition: "all 0.3s ease"
      }}>
        {tabs.map((tab, index) => (
          <div
            key={index}
            onClick={() => setActiveTab(index)}
            style={{
              padding: "8px 16px",
              backgroundColor: activeTab === index ? theme.activeTabBg : "transparent",
              borderBottom: activeTab === index ? "2px solid #3b82f6" : "none",
              color: activeTab === index ? theme.text : theme.inactiveTabText,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease"
            }}
          >
            {editingTabIndex === index ? (
              <form onSubmit={saveTabRename} style={{ display: "flex" }}>
                <input
                  type="text"
                  value={editingTabName}
                  onChange={handleTabRenameChange}
                  onKeyDown={handleTabRenameKeyPress}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={saveTabRename}
                  autoFocus
                  style={{
                    padding: "2px 4px",
                    fontSize: "14px",
                    backgroundColor: isDarkMode ? "#334155" : "#e2e8f0",
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "3px",
                    width: "120px",
                    outline: "none",
                    transition: "all 0.3s ease"
                  }}
                />
              </form>
            ) : (
              <>
                <span>{tab.name}</span>
                <button
                  onClick={(e) => startRenaming(index, e)}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.inactiveTabText,
                    fontSize: "12px",
                    cursor: "pointer",
                    padding: "0 4px"
                  }}
                  title="Rename File"
                >
                  ✎
                </button>
                {tabs.length > 1 && (
                  <button
                    onClick={(e) => closeTab(index, e)}
                    style={{
                      background: "none",
                      border: "none",
                      color: theme.inactiveTabText,
                      fontSize: "12px",
                      cursor: "pointer",
                      padding: "0 4px"
                    }}
                    title="Close Tab"
                  >
                    ✕
                  </button>
                )}
              </>
            )}
          </div>
        ))}

        {/* Generic Tab Button */}
        <button
          onClick={addGenericTab}
          style={{
            padding: "8px 12px",
            backgroundColor: "transparent",
            border: "none",
            color: theme.inactiveTabText,
            cursor: "pointer",
            fontSize: "16px",
            transition: "all 0.3s ease"
          }}
          title="New Tab"
        >
          +
        </button>
      </div>

      {/* Language Buttons Bar */}
      <div style={{
        display: "flex",
        backgroundColor: theme.headerBg,
        borderBottom: `1px solid ${theme.border}`,
        padding: "8px 10px",
        overflowX: "auto",
        flexWrap: "wrap", // Allow buttons to wrap on smaller screens
        transition: "all 0.3s ease"
      }}>
        <button
          onClick={() => addLanguageTab('java')}
          style={{
            padding: "4px 8px",
            marginRight: "8px",
            marginBottom: "4px",  // Add some margin for mobile view
            backgroundColor: "#3b82f6",
            border: "none",
            borderRadius: "4px",
            color: "white",
            fontSize: "12px",
            cursor: "pointer"
          }}
          title="Add Java File"
        >
          Java
        </button>
        <button
          onClick={() => addLanguageTab('python')}
          style={{
            padding: "4px 8px",
            marginRight: "8px",
            marginBottom: "4px",  // Add some margin for mobile view
            backgroundColor: "#10b981",
            border: "none",
            borderRadius: "4px",
            color: "white",
            fontSize: "12px",
            cursor: "pointer"
          }}
          title="Add Python File"
        >
          Python
        </button>
        <button
          onClick={() => addLanguageTab('cpp')}
          style={{
            padding: "4px 8px",
            marginRight: "8px",
            marginBottom: "4px",  // Add some margin for mobile view
            backgroundColor: "#f59e0b",
            border: "none",
            borderRadius: "4px",
            color: "white",
            fontSize: "12px",
            cursor: "pointer"
          }}
          title="Add C++ File"
        >
          C++
        </button>
        <button
          onClick={() => addLanguageTab('c')}
          style={{
            padding: "4px 8px",
            marginRight: "8px",
            marginBottom: "4px",  // Add some margin for mobile view
            backgroundColor: "#64748b",
            border: "none",
            borderRadius: "4px",
            color: "white",
            fontSize: "12px",
            cursor: "pointer"
          }}
          title="Add C File"
        >
          C
        </button>
        <button
          onClick={() => addLanguageTab('javascript')}
          style={{
            padding: "4px 8px",
            marginBottom: "4px",  // Add some margin for mobile view
            backgroundColor: "#eab308",
            border: "none",
            borderRadius: "4px",
            color: "white",
            fontSize: "12px",
            cursor: "pointer"
          }}
          title="Add JavaScript File"
        >
          JavaScript
        </button>
      </div>

      {/* Editor */}
      <div style={{ display: "flex", flex: 1, position: "relative", transition: "all 0.3s ease" }}>
        {/* Line numbers */}
        <div style={{
          padding: "15px 8px 15px 15px",
          backgroundColor: isDarkMode ? "#1e293b" : "#e2e8f0",
          color: theme.lineNumbers,
          fontFamily: "monospace",
          fontSize: "14px",
          textAlign: "right",
          userSelect: "none",
          width: "50px",
          overflow: "hidden",
          whiteSpace: "pre-line",
          lineHeight: "1.5",
          transition: "all 0.3s ease"
        }}>
          {getLineNumbers()}
        </div>

        {/* Code Editor */}
        <textarea
          value={tabs[activeTab].content}
          onChange={updateTabContent}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: "15px",
            backgroundColor: theme.bg,
            color: theme.text,
            border: "none",
            resize: "none",
            fontFamily: "monospace",
            fontSize: "14px",
            lineHeight: "1.5",
            outline: "none",
            overflowY: "auto",
            transition: "all 0.3s ease",
            minHeight: "200px" // Add a minimum height for the textarea
          }}
          spellCheck="false"
        />
      </div>
    </div>
  );
}