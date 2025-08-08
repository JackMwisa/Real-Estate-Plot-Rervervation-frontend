import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import { useImmerReducer } from "use-immer";
import StateContext from "../../Contexts/StateContext";
import {
  Grid,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Snackbar,
} from "@mui/material";

// Dropdown Options
const listingTypeOptions = ["", "Apartment", "House", "Office"];
const propertyStatusOptions = ["", "Sale", "Rent"];
const rentalFrequencyOptions = ["", "Month", "Week", "Day"];

function ListingUpdate({ listingData, closeDialog }) {
  const navigate = useNavigate();
  const GlobalState = useContext(StateContext);

  const initialState = {
    form: {
      title: listingData.title || "",
      listing_type: listingData.listing_type || "",
      description: listingData.description || "",
      property_status: listingData.property_status || "",
      price: listingData.price || "",
      rental_frequency: listingData.rental_frequency || "",
      rooms: listingData.rooms || 0,
      furnished: listingData.furnished || false,
      pool: listingData.pool || false,
      elevator: listingData.elevator || false,
      cctv: listingData.cctv || false,
      parking: listingData.parking || false,
    },
    sendRequest: 0,
    openSnack: false,
    snackMessage: "",
    disabledBtn: false,
  };

  function reducer(draft, action) {
    switch (action.type) {
      case "updateField":
        draft.form[action.field] = action.value;
        break;
      case "sendRequest":
        draft.sendRequest++;
        draft.disabledBtn = true;
        break;
      case "requestSuccess":
        draft.openSnack = true;
        draft.snackMessage = "You have successfully updated this listing!";
        break;
      case "requestError":
        draft.openSnack = true;
        draft.snackMessage = "Failed to update listing. Please try again.";
        draft.disabledBtn = false;
        break;
      case "closeSnack":
        draft.openSnack = false;
        break;
    }
  }

  const [state, dispatch] = useImmerReducer(reducer, initialState);

  function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "sendRequest" });
  }

  useEffect(() => {
    if (state.sendRequest) {
      async function updateListing() {
        const formData = new FormData();
        const f = state.form;

        // Special case for offices
        formData.append("title", f.title);
        formData.append("description", f.description);
        formData.append("listing_type", f.listing_type);
        formData.append("property_status", f.property_status);
        formData.append("price", f.price);
        formData.append("rental_frequency", f.rental_frequency);
        formData.append("rooms", f.listing_type === "Office" ? 0 : f.rooms);
        formData.append("furnished", f.furnished);
        formData.append("pool", f.pool);
        formData.append("elevator", f.elevator);
        formData.append("cctv", f.cctv);
        formData.append("parking", f.parking);
        formData.append("seller", GlobalState.userId);

        try {
          await Axios.patch(
            `https://www.lbrepcourseapi.com/api/listings/${listingData.id}/update/`,
            formData
          );
          dispatch({ type: "requestSuccess" });
          setTimeout(() => navigate(0), 1500);
        } catch {
          dispatch({ type: "requestError" });
        }
      }
      updateListing();
    }
  }, [state.sendRequest]);

  function priceLabel() {
    const { property_status, rental_frequency } = state.form;
    if (property_status === "Rent") {
      return rental_frequency
        ? `Price per ${rental_frequency}*`
        : "Price*";
    }
    return "Price*";
  }

  return (
    <div
      style={{
        width: "75%",
        margin: "3rem auto",
        border: "5px solid black",
        padding: "3rem",
      }}
    >
      <form onSubmit={handleSubmit}>
        <Grid container justifyContent="center">
          <Typography variant="h4">UPDATE LISTING</Typography>
        </Grid>

        {/* Title */}
        <TextField
          label="Title*"
          variant="standard"
          fullWidth
          value={state.form.title}
          onChange={(e) =>
            dispatch({ type: "updateField", field: "title", value: e.target.value })
          }
          sx={{ mt: 2 }}
        />

        {/* Dropdowns */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <TextField
              label="Listing Type*"
              variant="standard"
              fullWidth
              select
              SelectProps={{ native: true }}
              value={state.form.listing_type}
              onChange={(e) =>
                dispatch({ type: "updateField", field: "listing_type", value: e.target.value })
              }
            >
              {listingTypeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Property Status*"
              variant="standard"
              fullWidth
              select
              SelectProps={{ native: true }}
              value={state.form.property_status}
              onChange={(e) =>
                dispatch({ type: "updateField", field: "property_status", value: e.target.value })
              }
            >
              {propertyStatusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Rent frequency & price */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <TextField
              label="Rental Frequency"
              variant="standard"
              fullWidth
              select
              disabled={state.form.property_status === "Sale"}
              SelectProps={{ native: true }}
              value={state.form.rental_frequency}
              onChange={(e) =>
                dispatch({ type: "updateField", field: "rental_frequency", value: e.target.value })
              }
            >
              {rentalFrequencyOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              type="number"
              label={priceLabel()}
              variant="standard"
              fullWidth
              value={state.form.price}
              onChange={(e) =>
                dispatch({ type: "updateField", field: "price", value: e.target.value })
              }
            />
          </Grid>
        </Grid>

        {/* Description */}
        <TextField
          label="Description"
          variant="outlined"
          fullWidth
          multiline
          rows={6}
          sx={{ mt: 2 }}
          value={state.form.description}
          onChange={(e) =>
            dispatch({ type: "updateField", field: "description", value: e.target.value })
          }
        />

        {/* Rooms */}
        {state.form.listing_type !== "Office" && (
          <TextField
            label="Rooms"
            type="number"
            variant="standard"
            fullWidth
            sx={{ mt: 2 }}
            value={state.form.rooms}
            onChange={(e) =>
              dispatch({ type: "updateField", field: "rooms", value: e.target.value })
            }
          />
        )}

        {/* Checkboxes */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {["furnished", "pool", "elevator", "cctv", "parking"].map((field) => (
            <Grid item xs={2} key={field}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.form[field]}
                    onChange={(e) =>
                      dispatch({ type: "updateField", field, value: e.target.checked })
                    }
                  />
                }
                label={field.charAt(0).toUpperCase() + field.slice(1)}
              />
            </Grid>
          ))}
        </Grid>

        {/* Buttons */}
        <Grid container spacing={2} sx={{ mt: 3 }}>
          <Grid item xs={8} mx="auto">
            <Button
              variant="contained"
              fullWidth
              type="submit"
              sx={{
                backgroundColor: "green",
                color: "white",
                fontSize: "1.1rem",
                "&:hover": { backgroundColor: "darkgreen" },
              }}
              disabled={state.disabledBtn}
            >
              UPDATE
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button variant="outlined" fullWidth onClick={closeDialog}>
              CANCEL
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Snackbar */}
      <Snackbar
        open={state.openSnack}
        message={state.snackMessage}
        autoHideDuration={2000}
        onClose={() => dispatch({ type: "closeSnack" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </div>
  );
}

export default ListingUpdate;
