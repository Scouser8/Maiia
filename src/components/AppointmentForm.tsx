import * as Yup from 'yup';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Button,
  Grid,
  makeStyles,
  Snackbar,
  TextField,
} from '@material-ui/core';
import { formatDateRange } from 'utils/date';
import config from 'config';
import { Appointment } from '.prisma/client';
import axios from '../../axios';
import { getAppointments } from 'store/appointments';
import SuccessIndicator from './SuccessIndicator';

const useStyles = makeStyles((theme) => ({
  btnContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 35,
  },
  submitBtn: {
    color: '#01ab55',
    backgroundColor: '#ffffff',
    width: '125px',
    height: 40,
    fontSize: '1.1rem',
    textTransform: 'capitalize',
    border: '1px solid #01ab55',
    marginRight: 15,
    '&:hover': {
      background: '#01ab55',
      color: '#ffffff',
    },
  },
  resetBtn: {
    width: '125px',
    height: 40,
    fontSize: '1.1rem',
    textTransform: 'capitalize',
    border: '1px solid #424242',
  },
}));
const SERVER_API_ENDPOINT = config.get('SERVER_API_ENDPOING', '/api');

const validationSchema = Yup.object().shape({
  patientId: Yup.string().required('Required Field'),
  practitionerId: Yup.string().required('Required Field'),
  //used string here because this is just a date formatted string, not an date input
  startDate: Yup.string().required('Required Field'),
  endDate: Yup.string().required('Required Field'),
});

interface FormData {
  patientId: string;
  practitionerId: string;
  startDate: string;
  endDate: string;
}

const AppointmentForm = ({
  practitioners,
  patients,
  appointmentToEdit,
  initialAvailabilities = [],
  setOpenPopup,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  //All the keys to be passed for the form as initial values & also updates will reflect here.
  const [formData, updateFormData] = useState<FormData>({
    patientId: appointmentToEdit?.patientId || '',
    practitionerId: appointmentToEdit?.practitionerId || '',
    startDate: appointmentToEdit?.startDate || '',
    endDate: appointmentToEdit?.endDate || '',
  });
  // This is the index of selected availability from the array having all available practitioner slots.
  // This is used to make the availability input controlled, so for example I can easily reset the
  // value whenever I need
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(null);

  // List of availabilities which is changing depending on which practirioner is selected.
  // When editing an item the initial value will be the list of the practitioner included in this appointment.
  const [availabilities, setAvailabilities] = useState<Appointment[]>(
    initialAvailabilities || [],
  );

  // Feedback about the possible actions.
  const [showSuccessMesage, setShowSuccessMessage] = useState<boolean>(false);
  const [successText, setSuccessText] = useState<string>('');

  // If we are editing an item, at the INITIAL RENDER ONLY we find the index the current selected slot
  // to be selected from the availabilities array, however on changing the availbility or practitioner this
  // won't do anything.
  useEffect(() => {
    if (appointmentToEdit) {
      const index = initialAvailabilities?.findIndex(
        (item) => item.startDate === formData.startDate,
      );
      setSelectedSlotIndex(index);
    }
  }, []);

  // Setting availabilities depending on the selected practitioner.
  // Used fetch here as a proof of concept that I can use it, however for other requests I preferred
  // to use axios to write less code which is much cleaner, beside axios setting up much more boilerplate,
  const getAvailabilities = async (practitionerId: string) => {
    const rawResponse = await fetch(
      `${SERVER_API_ENDPOINT}/availabilities?practitionerId=${practitionerId}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );
    const content = await rawResponse.json();
    setAvailabilities(content);
    // Update the practitionerId & clear the selected available slot on change, because the
    // whole list is changing to avoid side effects
    updateFormData({ ...formData, practitionerId, startDate: '', endDate: '' });
    setSelectedSlotIndex('');
  };

  // This function recieves the index of the selected slot, so we can pick the starting & ending date.
  // This is done because we only have one input for both, as it's not logical to make the user select both dates
  // The slot is limited within a timeframe, so the end date couldn't be chosen as it is dependant on the start date.
  const handleDateChange = (index: string) => {
    setSelectedSlotIndex(index);

    updateFormData({
      ...formData,
      startDate: index ? availabilities[index].startDate : '',
      endDate: index ? availabilities[index].endDate : '',
    });
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    if (appointmentToEdit) {
      try {
        await axios.put(
          `/appointments?appointmentId=${appointmentToEdit.id}`,
          formData,
        );
        handleStateReset();
        setSubmitting(false);
        dispatch(getAppointments());
      } catch {}
    } else {
      try {
        await axios.post(`/appointments`, formData);
        setSuccessText('Appointment added successfully');
        setShowSuccessMessage(true);
        handleStateReset();
        setSubmitting(false);
        dispatch(getAppointments());
      } catch {}
    }
  };

  const handleStateChange = (e: any) => {
    const value = e.target.value;

    updateFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleStateReset = () => {
    setSelectedSlotIndex('');
    updateFormData({
      patientId: '',
      practitionerId: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleSuccessClose = (
    event?: React.SyntheticEvent,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowSuccessMessage(false);
  };

  return (
    <div>
      <Formik
        initialValues={formData}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          handleChange,
          handleSubmit,
          handleBlur,
          handleReset,
          touched,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {/* <p className={classes.inputLabel}>Practitioner (required)</p> */}
                <TextField
                  select
                  variant="outlined"
                  label="Patient *"
                  name="patientId"
                  fullWidth
                  value={formData.patientId}
                  error={Boolean(touched.patientId && errors.patientId)}
                  helperText={touched.patientId && errors.patientId}
                  onBlur={handleBlur}
                  onChange={(e) => {
                    handleChange(e);
                    handleStateChange(e);
                  }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value=""></option>
                  {patients?.map((practitioner) => (
                    <option
                      key={`practitioner-${practitioner.id}`}
                      value={practitioner.id}
                    >
                      {`${practitioner.firstName} ${practitioner.lastName}`}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                {/* <p className={classes.inputLabel}>Patient (required)</p> */}
                <TextField
                  select
                  variant="outlined"
                  label="Practitioner *"
                  name="practitionerId"
                  fullWidth
                  value={formData.practitionerId}
                  error={Boolean(
                    touched.practitionerId && errors.practitionerId,
                  )}
                  helperText={touched.practitionerId && errors.practitionerId}
                  onBlur={handleBlur}
                  onChange={(e) => {
                    getAvailabilities(e.target.value);
                    handleChange(e);
                    // Reset the values of start & end date because the list of availabilities is changed now.
                    values.startDate = '';
                    values.endDate = '';
                  }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value=""></option>
                  {practitioners?.map((practitioner) => (
                    <option
                      key={`practitioner-${practitioner.id}`}
                      value={practitioner.id}
                    >
                      {`${practitioner.firstName} ${practitioner.lastName} (${practitioner.speciality})`}
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  disabled={!availabilities.length}
                  select
                  variant="outlined"
                  label="Appointment date *"
                  name="startDate"
                  fullWidth
                  value={selectedSlotIndex}
                  error={Boolean(touched.startDate && errors.startDate)}
                  helperText={touched.startDate && errors.startDate}
                  onBlur={handleBlur}
                  onChange={(e) => {
                    const index = e.target.value;
                    // The index value is for the option selected, so we can set the start & ending date for our
                    // form data state
                    // Take care that if the user select the empty option, if you use it to access the availabilities
                    // array that would lead to an error, instead update the value with a nullable one.
                    handleDateChange(index);
                    values.startDate = index
                      ? availabilities[index].startDate
                      : '';
                    values.endDate = index ? availabilities[index].endDate : '';
                  }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value=""></option>
                  {availabilities?.map((availability, index) => (
                    <option
                      key={`availability-${availability.id}`}
                      // value={availability.startDate}
                      value={index}
                    >
                      {formatDateRange({
                        from: new Date(availability.startDate),
                        to: new Date(availability.endDate),
                      })}
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <div className={classes.btnContainer}>
              <Button
                className={classes.submitBtn}
                type="submit"
                disabled={isSubmitting}
              >
                Submit
              </Button>
              <Button
                className={classes.resetBtn}
                onClick={() => {
                  handleStateReset();
                  handleReset();
                }}
                disabled={isSubmitting}
              >
                Reset
              </Button>
            </div>
          </form>
        )}
      </Formik>
      <SuccessIndicator
        showSuccessMesage={showSuccessMesage}
        handleSuccessClose={handleSuccessClose}
        successText={successText}
      />
    </div>
  );
};

export default AppointmentForm;
