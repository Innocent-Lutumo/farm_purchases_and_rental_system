import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import { useReactToPrint } from "react-to-print";

const RentalAgreement = () => {
  const [agreementData, setAgreementData] = useState(null); // Store the fetched data
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Track errors
  const agreementRef = useRef(); // Reference for printing the agreement

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetching data from multiple APIs concurrently using Promise.all
        const [
          landownerResponse,
          lesseeResponse,
          rentResponse,
          propertyResponse,
          agreementResponse
        ] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/farmsrent/"), 
          fetch("/api/lessee"),    // Replace with actual lessee API endpoint
          fetch("/api/rent"),      // Replace with actual rent API endpoint
          fetch("/api/property"),  // Replace with actual property API endpoint
          fetch("/api/agreement"), // Replace with actual agreement API endpoint
        ]);

        // Check if all responses are OK
        if (!landownerResponse.ok || !lesseeResponse.ok || !rentResponse.ok || !propertyResponse.ok || !agreementResponse.ok) {
          throw new Error('Failed to fetch data from one or more APIs');
        }

        // Parse all JSON responses
        const landownerData = await landownerResponse.json();
        const lesseeData = await lesseeResponse.json();
        const rentData = await rentResponse.json();
        const propertyData = await propertyResponse.json();
        const agreementData = await agreementResponse.json();

        // Combine the data from all APIs
        const combinedData = {
          ...landownerData,
          ...lesseeData,
          ...rentData,
          ...propertyData,
          ...agreementData,
        };

        setAgreementData(combinedData); // Set the combined data
      } catch (error) {
        setError(error.message); // Handle errors
      } finally {
        setLoading(false); // Set loading to false once the fetch is complete
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this effect runs only once

  const handlePrint = useReactToPrint({ content: () => agreementRef.current });

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  if (error) {
    return <div>Error: {error}</div>; // Show error message if fetch fails
  }

  // If agreementData is available, render the agreement
  if (agreementData) {
    const {
      landownerName,
      landownerAddress,
      landownerEmail,
      full_name,
      lesseeAddress,
      rent,
      location,
      parcelId,
      startDate,
      endDate,
      agreementDate,
    } = agreementData;

    return (
      <Box
        sx={{
          maxWidth: 900,
          mx: 'auto',
          p: 4,
          background: 'linear-gradient(135deg, #e0f7fa 0%, #fff 100%)',
          boxShadow: 3,
          borderRadius: 3,
          fontFamily: 'Georgia, serif',
        }}
      >
        <Box sx={{ textAlign: 'right', mb: 2 }}>
          <Button variant="contained" color="primary" onClick={handlePrint}>
            Download / Print Agreement
          </Button>
        </Box>
        <Card
          ref={agreementRef}
          variant="outlined"
          sx={{
            border: '1px solid #90caf9',
            backgroundColor: '#ffffffcc',
            backdropFilter: 'blur(4px)',
            borderRadius: 2,
            p: 3,
            boxShadow: 5,
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              gutterBottom
              align="center"
              sx={{ fontWeight: 'bold', color: '#1976d2' }}
            >
              Land Rental Agreement
            </Typography>
            <Typography paragraph>
              This Land Rental Agreement ("Agreement") is made and entered into on
              this {agreementDate}, by and between:
            </Typography>
            <Typography paragraph>
              <strong>Landowner (Lessor):</strong> {landownerName}
              <br />
              {landownerAddress}
              <br />
              Email: {landownerEmail}
            </Typography>
            <Typography paragraph>
              <strong>Tenant (Lessee):</strong> {full_name}
              <br />
              {lesseeAddress}
            </Typography>
            <Typography paragraph>
              <strong>1. Description of the Property:</strong> 30 acres located at{' '}
              {location}, legally identified as Parcel ID {parcelId}.
            </Typography>
            <Typography paragraph>
              <strong>2. Term of Lease:</strong> From {startDate} to {endDate}.
            </Typography>
            <Typography paragraph>
              <strong>3. Rent:</strong> ${rent} per year, payable in two equal
              installments.
            </Typography>
            <Typography paragraph>
              <strong>4. Use of Land:</strong> Exclusively for agricultural purposes.
              No construction without written consent.
            </Typography>
            <Typography paragraph>
              <strong>5. Maintenance:</strong> Lessee shall maintain the land in good
              agricultural condition.
            </Typography>
            <Typography paragraph>
              <strong>6. Utilities and Taxes:</strong> Lessee pays utilities; Lessor pays
              property taxes.
            </Typography>
            <Typography paragraph>
              <strong>7. Insurance:</strong> Lessee shall carry liability insurance with at least $1,000,000 coverage.
            </Typography>
            <Typography paragraph>
              <strong>8. Termination Clause:</strong> Either party may terminate with 90 days written notice upon breach.
            </Typography>
            <Typography paragraph>
              <strong>9. Dispute Resolution:</strong> Resolved through arbitration in the local jurisdiction.
            </Typography>
            <Typography paragraph>
              <strong>10. Governing Law:</strong> The laws of the respective state shall govern this Agreement.
            </Typography>
            <Typography paragraph>
              <strong>IN WITNESS WHEREOF</strong>, the parties have executed this Agreement on the date first above written.
            </Typography>
            <Box sx={{ mt: 5 }}>
              <Typography paragraph>
                _________________________
                <br />
                {landownerName}, Lessor
              </Typography>
              <Typography paragraph>
                _________________________
                <br />
                {full_name}, Lessee
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return null; 
};

export default RentalAgreement;
