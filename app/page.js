'use client';
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { Box, Typography, Modal, TextField, Stack, Button } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from 'firebase/firestore';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import './globals.css';
import SpaIcon from '@mui/icons-material/Spa';
import ReactMarkdown from 'react-markdown';


export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState('');
  const [searchName, setSearchName] = useState('');
  const [recipes, setRecipes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to call the API to generate recipes
  const onSubmit = async () => {
    const prePrompt = `
You are an AI nutrition expert tasked with analyzing a list of food items and their quantities. Based on this information, you need to:
1. **Retrieve the nutritional information** for each food item.
2. **Calculate a nutritional score** based on the nutritional content.
3. **Generate personalized advice** for improving the nutritional quality of the meal.
4. **Recommend healthier food swaps** if necessary.

Here is the list of food items and their quantities:`

const afterPrompt= `

### Task 1: Retrieve Nutritional Information
1. For each food item and quantity, retrieve the following nutritional information:
   - Calories
   - Fats (g)
   - Sugars (g)
   - Proteins (g)
   - Fiber (g)
   - Sodium (mg) 

### Task 2: Calculate Nutritional Score
1. Evaluate the overall nutritional quality of the meal based on the retrieved nutritional information.
2. Calculate a nutritional score from 0 to 100, where a higher score represents a healthier meal.

### Task 3: Generate Personalized Recommendations
1. Provide feedback on how to improve the meal’s nutritional quality, including:
   - Suggestions for reducing excess calories, sugars, or fats.
   - Recommendations for increasing the intake of proteins, fiber, or essential vitamins.
   - Warnings for high sodium or unhealthy fats.
    `;
    const allItems = inventory.map(item => item.name).join(', ');
    const fullPrompt = prePrompt + allItems + afterPrompt;
    console.log('Prompt being sent to AI:', fullPrompt); // Log the prompt
  
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: fullPrompt }), // Use all items as prompt
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch the recipe');
      }
  
      const data = await response.json();
      console.log('Generated Recipe:', data.message);
      setRecipes(data.message);
    } catch (error) {
      console.error('Failed to fetch the recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };
  
  const removeItem = async (itemName) => {
    if (!itemName) return;
  
    const docRef = doc(collection(firestore, 'inventory'), itemName);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const data = docSnap.data();
      const { quantity, unit } = data;
  
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1, unit: unit || '' }); // Preserve unit
      }
    }
  
    await updateInventory();
  };
  

  const addItem = async (itemName, unit = '') => {
    if (!itemName.trim()) {
      console.error('Item name cannot be empty');
      return;
    }
  
    const docRef = doc(collection(firestore, 'inventory'), itemName);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const data = docSnap.data();
      const newQuantity = (data.quantity || 0) + 1;
      const updatedUnit = unit.trim() || data.unit || ''; // Default to existing unit or empty string
  
      await setDoc(docRef, { quantity: newQuantity, unit: updatedUnit });
    } else {
      await setDoc(docRef, { quantity: 1, unit: unit.trim() || '' });
    }
  
    await updateInventory();
  };
  
  
  

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddItem = async () => {
    if (itemName.trim()) {
      await addItem(itemName, unit); // Pass itemName and unit to addItem
      handleClose(); // Close the modal and clear inputs
    } else {
      console.error('Item name cannot be empty');
    }
  };
  
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchName.toLowerCase())
  );

  function DenseTable({ rows, onAdd, onRemove }) {
    return (
      <TableContainer component={Paper} className="mainTable">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Unit</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.name.charAt(0).toUpperCase() + row.name.slice(1)}
                </TableCell>
                <TableCell align="right">{row.quantity}</TableCell>
                <TableCell align="right">{row.unit}</TableCell>
                <TableCell align="right">
                  <Button
                    className="miniAdd"
                    variant="outlined"
                    onClick={() => onAdd(row.name)}
                  >
                    Add
                  </Button>
                  <Button
                    className="miniRemove"
                    variant="outlined"
                    onClick={() => onRemove(row.name)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      {/* Add Item popout Box */}
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          sx={{
            transform: 'translate(-50%, -50%)'
          }}
          width={600}
          bgcolor={"whitesmoke"}
          
          border="1px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          borderRadius={5}
         
          
        >
          <Typography variant="h6" >Add Item</Typography>
          <Stack
            width="100%"
            direction="row"
            spacing={2}
          >
            <TextField
              variant="outlined"
              
              fullWidth
              placeholder='Item'
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              variant="outlined"
              placeholder='Unit (Optional)'
              fullWidth
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={handleAddItem}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Navbar */}
      <Box className="nav">
        <SpaIcon sx={{ fontSize: 70 }} />
        <Typography variant="h2" color="#333">NutriPal</Typography>
      </Box>

      {/* Recipe Prompt Section */}
    <Box className="testbar">
      <Button type="submit" onClick={onSubmit} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Generate Recipe'}
      </Button>
    </Box>

    {recipes && (
      <Box>
        <Typography variant="h6">Recipe:</Typography>
        <ReactMarkdown>{recipes}</ReactMarkdown>
      </Box>
    )}


      {/* Search Bar */}
      <Box className="searchbar">
        <TextField
          fullWidth
          label="Search Items"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </Box>

      <Button
        variant="contained"
        className="addNew"
        onClick={() => handleOpen()}
      >
        Add New Item
      </Button>

      {/* Table and Button Container */}
      <Box className="tableContainer">
        <DenseTable
          rows={filteredInventory}
          onAdd={addItem}
          onRemove={removeItem}
        />
      </Box>
    </Box>
  );
}
