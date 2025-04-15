import { useState, useEffect } from "react";

export default function PomodoroEditor() {
  const [timeLeft, setTimeLeft] = useState(60);
  const [minutes, setMinutes] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editingTabIndex, setEditingTabIndex] = useState(null);
  const [editingTabName, setEditingTabName] = useState("");
  const [tabs, setTabs] = useState([
    {
      name: "Main.java",
      content: `// Java DSA Practice Template
public class Main {
    public static void main(String[] args) {
        // Your code here
        int[] array = {5, 3, 8, 4, 2};
        
        // Example: Print the array
        for(int i = 0; i < array.length; i++) {
            System.out.print(array[i] + " ");
        }
    }
}`
    }
  ]);

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

  // Get boilerplate code based on file extension
  const getBoilerplateForExtension = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const baseName = filename.split('.');
    
    switch(extension) {
      case 'java':
        return `// Java Class Template
public class ${baseName} {
    public static void main(String[] args) {
        // Your Java code here
        System.out.println("Hello from ${baseName}");
    }
}`;
      case 'py':
        return `# Python Script Template
def main():
    # Your Python code here
    print("Hello from ${baseName}")

if __name__ == "__main__":
    main()`;
      case 'c':
        return `/* C Program Template */
#include <stdio.h>
#include <stdlib.h>

int main() {
    // Your C code here
    printf("Hello from ${baseName}\\n");
    return 0;
}`;
      case 'cpp':
        return `/* C++ Program Template */
#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Your C++ code here
    cout << "Hello from ${baseName}" << endl;
    return 0;
}`;
      case 'js':
        return `// JavaScript Template
function main() {
    // Your JavaScript code here
    console.log("Hello from ${baseName}");
}

main();`;
      default:
        return `// New file: ${filename}
// Add your code here`;
    }
  };

  // Add new tab with specific language
  const addNewTab = (extension = 'java') => {
    const baseName = `File${tabs.length + 1}`;
    const newTabName = `${baseName}.${extension}`;
    setTabs([...tabs, {
      name: newTabName,
      content: getBoilerplateForExtension(newTabName)
    }]);
    setActiveTab(tabs.length);
  };

  // Add new language-specific tab
  const addLanguageTab = (lang) => {
    const extensions = {
      'java': 'java',
      'python': 'py',
      'c': 'c',
      'cpp': 'cpp',
      'javascript': 'js'
    };
    addNewTab(extensions[lang]);
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

  // Update class name in Java files
  const updateClassNameInContent = (oldName, newName, content) => {
    // Only process Java files
    if (!newName.endsWith('.java')) return content;
    
    const oldClassName = oldName.split('.');
    const newClassName = newName.split('.');
    
    // Simple regex to replace the class name
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
      backgroundColor: "#0d1b2a",
      color: "#e0e1dd"
    }}>
      {/* Header */}
      <div style={{ 
        display: "flex",
        backgroundColor: "#1e293b",
        borderBottom: "1px solid #334155",
        padding: "10px 15px",
        alignItems: "center"
      }}>
        {/* Title */}
        <div style={{
          background: "linear-gradient(90deg, #3a1c71, #6b46c1)",
          padding: "8px 16px",
          borderRadius: "6px",
          marginRight: "20px"
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
          background: "linear-gradient(90deg, #3a1c71, #6b46c1)",
          padding: "6px 16px",
          borderRadius: "6px",
          marginRight: "auto",
          marginLeft: "auto"
        }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", marginRight: "12px" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="number"
            min="1"
            max="60"
            value={minutes}
            onChange={handleMinutesChange}
            style={{ 
              width: "50px",
              padding: "5px",
              backgroundColor: "#334155",
              color: "white",
              border: "1px solid #475569",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          />
          <span>mins</span>
          <button
            onClick={saveCode}
            style={{
              backgroundColor: "transparent",
              color: "#e0e1dd",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
              padding: "4px 8px"
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
        backgroundColor: "#1e293b",
        borderBottom: "1px solid #334155",
        padding: "0 10px",
        overflowX: "auto",
        whiteSpace: "nowrap"
      }}>
        {tabs.map((tab, index) => (
          <div 
            key={index}
            onClick={() => setActiveTab(index)}
            style={{
              padding: "8px 16px",
              backgroundColor: activeTab === index ? "#0d1b2a" : "transparent",
              borderBottom: activeTab === index ? "2px solid #3b82f6" : "none",
              color: activeTab === index ? "#fff" : "#94a3b8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
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
                    backgroundColor: "#334155",
                    color: "#fff",
                    border: "1px solid #4b5563",
                    borderRadius: "3px",
                    width: "120px",
                    outline: "none"
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
                    color: "#94a3b8",
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
                      color: "#94a3b8",
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
        
        {/* Language Menu */}
        <div style={{ position: "relative", display: "inline-block" }}>
          <button
            onClick={() => addNewTab()}
            style={{
              padding: "8px 12px",
              backgroundColor: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "16px"
            }}
            title="New Tab"
          >
            +
          </button>
          <div style={{
            position: "absolute",
            right: 0,
            top: "100%",
            backgroundColor: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "4px",
            zIndex: 10,
            width: "120px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            display: "none"
          }}
          onMouseEnter={(e) => e.currentTarget.style.display = "block"}
          onMouseLeave={(e) => e.currentTarget.style.display = "none"}
          >
            <button
              onClick={() => addLanguageTab('java')}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                backgroundColor: "transparent",
                border: "none",
                color: "#e0e1dd",
                cursor: "pointer"
              }}
            >
              Java
            </button>
            <button
              onClick={() => addLanguageTab('python')}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                backgroundColor: "transparent",
                border: "none",
                color: "#e0e1dd",
                cursor: "pointer"
              }}
            >
              Python
            </button>
            <button
              onClick={() => addLanguageTab('c')}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                backgroundColor: "transparent",
                border: "none",
                color: "#e0e1dd",
                cursor: "pointer"
              }}
            >
              C
            </button>
            <button
              onClick={() => addLanguageTab('cpp')}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                backgroundColor: "transparent",
                border: "none",
                color: "#e0e1dd",
                cursor: "pointer"
              }}
            >
              C++
            </button>
            <button
              onClick={() => addLanguageTab('javascript')}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                backgroundColor: "transparent",
                border: "none",
                color: "#e0e1dd",
                cursor: "pointer"
              }}
            >
              JavaScript
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div style={{ display: "flex", flex: 1, position: "relative" }}>
        {/* Line numbers */}
        <div style={{
          padding: "15px 8px 15px 15px",
          backgroundColor: "#1e293b",
          color: "#64748b",
          fontFamily: "monospace",
          fontSize: "14px",
          textAlign: "right",
          userSelect: "none",
          width: "50px",
          overflow: "hidden",
          whiteSpace: "pre-line",
          lineHeight: "1.5"
        }}>
          {getLineNumbers()}
        </div>

        {/* Code Editor - Clean without HTML-based syntax highlighting */}
        <textarea
          value={tabs[activeTab].content}
          onChange={updateTabContent}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: "15px",
            backgroundColor: "#0d1b2a",
            color: "#e0e1dd",
            border: "none",
            resize: "none",
            fontFamily: "monospace",
            fontSize: "14px",
            lineHeight: "1.5",
            outline: "none",
            overflowY: "auto"
          }}
          spellCheck="false"
        />
      </div>
    </div>
  );
}
