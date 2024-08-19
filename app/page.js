'use client';
import { useState, useEffect } from 'react';
import { firestore } from '../firebase.js';
import { Box,
  Button,
  Modal,
  Stack,
  TextField,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  AppBar,
  Toolbar,
  IconButton} from '@mui/material';
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from 'firebase/firestore';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import './globals.css';
import SpaIcon from '@mui/icons-material/Spa';
import ReactMarkdown from 'react-markdown';
import GridLoader from "react-spinners/ClipLoader";


export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [unit, setUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [searchName, setSearchName] = useState('');
  const [recipes, setRecipes] = useState('');

  const [isLoadingHP, setIsLoadingHP] = useState(false);
  const [isLoadingLC, setIsLoadingLC] = useState(false);
  const [isLoadingPB, setIsLoadingPB] = useState(false);
  const [isLoadingGP, setIsLoadingGP] = useState(false);

  
  //Prompt for High Protein Meals
  const onSubmitHP = async () => {
    const prePrompt = `
"Using the following ingredients from the user's table in this format: 'quantity x item (weight or units)', where the total quantity is calculated as (quantity * weight), generate a high-protein recipe. Prioritize maximizing the protein content while balancing with healthy fats and carbohydrates.`

const afterPrompt= `

For each ingredient, calculate the total weight by multiplying the quantity by the weight (e.g., '5 x Chicken (2kg)' means 10kg of chicken). Use the calculated total weight for each ingredient to estimate the protein, fats, and carbs in the recipe but dont display in the output and make sure the output is concise, confident and presentable.

Display the result in the following structure:
- Recipe Name
- Ingredients 
- Instructions (clear step-by-step)
- Nutritional Breakdown (Accurate calories, protein, fats, carbs)
- Serving Size.
    `;

    const allItems = inventory
  .map(item => `${item.quantity} x ${item.name} (${item.unit})`)
  .join(', ');

    const fullPrompt = prePrompt + allItems + afterPrompt;
  
    setIsLoadingHP(true);
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: fullPrompt }), 
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
      setIsLoadingHP(false);
    }
  };
  

  //Prompt for Low Carb Meals
  const onSubmitLC = async () => {
    const prePrompt = `
Using the following ingredients from the user's table in this format: 'quantity x item (weight or units)', where the total quantity is calculated as (quantity * weight), generate a low-carb recipe. Prioritize minimizing carbohydrate content while ensuring sufficient protein and healthy fats.`

const afterPrompt= `

For each ingredient, calculate the total weight by multiplying the quantity by the weight (e.g., '5 x Chicken (2kg)' means 10kg of chicken). Use the calculated total weight for each ingredient to estimate the protein, fats, and carbs in the recipe but dont display in the ouput and make sure the output is concise, confident and presentable.

Display the result in the following structure:
- Recipe Name
- Ingredients (with total weight and calculated carb content per item)
- Instructions (clear step-by-step)
- Nutritional Breakdown (calories, protein, fats, carbs, keeping carbs low)
- Serving Size."
    `;


  
    const allItems = inventory
  .map(item => `${item.quantity} x ${item.name} (${item.unit})`)
  .join(', ');

    const fullPrompt = prePrompt + allItems + afterPrompt;
  
    setIsLoadingLC(true);
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: fullPrompt }), 
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
      setIsLoadingLC(false);
    }
  };
  
  //Prompt for Plant Based Meals
  const onSubmitPB = async () => {
    const prePrompt = `
Using the following ingredients from the user's table in this format: 'quantity x item (weight or units)', where the total quantity is calculated as (quantity * weight), generate a plant-based recipe. Only include plant-based ingredients, and prioritize a balance of protein, healthy fats, and carbohydrates. If this isnt possible, tell the user that the items they have is not suitable for this diet and give them alternative relvant to the list given.`

const afterPrompt= `

For each ingredient, calculate the total weight by multiplying the quantity by the weight (e.g., '5 x Chicken (2kg)' means 10kg of chicken). Use the calculated total weight for each ingredient to estimate the protein, fats, and carbs in the recipe but dont display in the ouput and make sure the output is concise, confident and presentable.

Display the result in the following structure:
- Recipe Name
- Ingredients (with total weight and calculated carb content per item)
- Instructions (clear step-by-step)
- Nutritional Breakdown (calories, protein, fats, carbs, keeping carbs low)
- Serving Size."
    `;


  
    const allItems = inventory
  .map(item => `${item.quantity} x ${item.name} (${item.unit})`)
  .join(', ');

    const fullPrompt = prePrompt + allItems + afterPrompt;
  
    setIsLoadingPB(true);
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: fullPrompt }), 
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
      setIsLoadingPB(false);
    }
  };

  //Prompt for Generic 3 Meal Plan
  const onSubmitGP = async () => {
    const prePrompt = `
Using the following ingredients from the user's table in this format: 'quantity x item (weight or units)', where the total quantity is calculated as (quantity * weight), generate a balanced 3-meal plan (breakfast, lunch, and dinner). Ensure that each meal includes a balance of protein, healthy fats, and carbohydrates to support a healthy diet.
`

const afterPrompt= `

For each ingredient, calculate the total weight by multiplying the quantity by the weight (e.g., '5 x Chicken (2kg)' means 10kg of chicken). Use the calculated total weight for each ingredient to estimate the protein, fats, and carbs in each meal but dont display it in the ouput and make sure the output is concise, confident and presentable.

Display the result in the following structure and break line between each:
- Meal Plan (Breakfast, Lunch, Dinner)
- Ingredients for each meal (with total weight and calculated protein, fats, and carbs per item)
- Instructions (clear step-by-step for each meal)
- Nutritional Breakdown (calories, protein, fats, carbs per meal)
- Serving Size."

    `;


  
    const allItems = inventory
  .map(item => `${item.quantity} x ${item.name} (${item.unit})`)
  .join(', ');

    const fullPrompt = prePrompt + allItems + afterPrompt;
  
    setIsLoadingGP(true);
    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: fullPrompt }), 
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
      setIsLoadingGP(false);
    }
  };

  //Update the inventory
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
  
  //Remove an item
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
        await setDoc(docRef, { quantity: quantity - 1, unit: unit || '' }); 
      }
    }
  
    await updateInventory();
  };
  

  //Add a new item
  const addItem = async (itemName, quantity = 1, unit = '') => {
    if (!itemName.trim()) {
      console.error('Item name cannot be empty');
      return;
    }
  
    const docRef = doc(collection(firestore, 'inventory'), itemName);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const data = docSnap.data();
      const newQuantity = (data.quantity || 0) + (quantity || 1);
      const updatedUnit = unit.trim() || data.unit || ''; 
  
      await setDoc(docRef, { quantity: newQuantity, unit: updatedUnit });
    } else {
      await setDoc(docRef, { quantity: quantity || 1, unit: unit.trim() || '' }); 
    }
  
    await updateInventory();
  };
  
  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  //Add New Item Button
  const handleAddItem = async () => {
    if (itemName.trim()) {
      const parsedQuantity = Number(quantity);
      await addItem(itemName, isNaN(parsedQuantity) ? 1 : parsedQuantity, unit); 
      setItemName(''); 
      setQuantity(''); 
      setUnit(''); 
      handleClose(); 
    } else {
      console.error('Item name cannot be empty');
    }
  };
  
  //Search Functionality
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchName.toLowerCase())
  );

  //Table Layout
  function DenseTable({ rows, onAdd, onRemove }) {
    return (
      <TableContainer component={Paper} className="mainTable">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Size</TableCell>
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
    className="parentBox"
      width="100vw"
      
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >

      {/* Navbar */}
      <AppBar position='static'>
      <Toolbar className="nav">
        <SpaIcon sx={{ fontSize: 70}} />
        <Typography  variant="h2" color="#def6ca" component="div" sx={{ flexGrow: 1 }}>NutriPal</Typography>
      </Toolbar>
</AppBar>

<Box
className="topRow"
        width="100vw"
        height="20rem"
        
        mb="-10rem"
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding={3}
      >

      


      <Stack 
      mt="-10rem"
    
      mr="20rem"
      direction="row"
      spacing={20} 
      alignItems="center" 
      className="recipeContainer">


   {/* Search Bar */}
   <Stack 
   className="searchbar"
   direction="row"
  spacing={2}>
        <TextField
          
          fullWidth
          label="Search Items"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      

      <Button
        variant="contained"
        className="addNew"
        onClick={() => handleOpen()}
      >
        Add New Item
      </Button>
      </Stack>
  <Box className="testbar">
    <Button type="submit" onClick={onSubmitHP} disabled={isLoadingHP}>
      {isLoadingHP ? <GridLoader color="#def6ca"/> : 'Generate High Protein Recipe'}
    </Button>
    <Button type="submit" onClick={onSubmitLC} disabled={isLoadingLC}>
      {isLoadingLC ? <GridLoader color="#def6ca"/> : 'Generate Low Carb Recipe'}
    </Button>
    <Button type="submit" onClick={onSubmitPB} disabled={isLoadingPB}>
      {isLoadingPB ? <GridLoader color="#def6ca"/> : 'Generate Plant Based Recipe'}
    </Button>
    <Button type="submit" onClick={onSubmitGP} disabled={isLoadingGP}>
      {isLoadingGP ? <GridLoader color="#def6ca"/> : 'Generate Generic 3 Meal Plan'}
    </Button>
  </Box>

 
</Stack>
</Box>

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
              placeholder='Quantity'
              fullWidth
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <TextField
              variant="outlined"
              placeholder='Size (Optional)'
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

<Box
width="92vw"

>
  
 {/*Recipe Output Box */}
 <Stack

 direction="row"


spacing="5vw" 
 alignItems="center"
 >
      {/* Table and Button Container */}
      <Box className="tableContainer"
      >
        <DenseTable
          rows={filteredInventory}
          onAdd={addItem}
          onRemove={removeItem}
        />
      </Box>

      <Box
    width="100%"
    maxWidth={800}
    p={2}
    bgcolor="#79b79120"
    borderRadius={4}
    boxShadow={1}
    mt={2}
    mb={2}
    className="recipeBox"
  >
    <Typography variant="h6" color="black" mb={1}>
      Generated Recipe:
    </Typography>
    <TextField
      variant="outlined"
      multiline
      fullWidth
      minRows={10}
      maxRows={20}
      value={recipes}
      InputProps={{ readOnly: true }}
    />
  </Box>

      </Stack>
    </Box>
    </Box>
  );
}
