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
import { Spa } from '@mui/icons-material';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchName, setSearchName] = useState('');

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

  const removeItem = async (item) => {
    if (!item) return; // Prevent empty item names

    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const addItem = async (item) => {
    if (!item) return; // Prevent empty item names

    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchName.toLowerCase())
  );

  // Define the DenseTable component inside the same file
  function DenseTable({ rows, onAdd, onRemove }) {
    return (
      <TableContainer component={Paper} className="mainTable">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell align="right">Quantity</TableCell> {/* Align to the right */}
              <TableCell align="right">Action</TableCell> {/* Align to the right */}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.name.charAt(0).toUpperCase() + row.name.slice(1)}
                </TableCell>
                <TableCell align="right">{row.quantity}</TableCell> {/* Align to the right */}
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
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack
            width="100%"
            direction="row"
            spacing={2}
          >
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box className="nav">
      {<SpaIcon sx={{ fontSize: 70 }}/> }
        <Typography
          variant="h2"
          color="#333"
        >
          NutriCalc
        </Typography>
      </Box>

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
