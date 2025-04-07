import { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchMeetingData } from "../redux/slices/meetingSlice";
import { toast } from 'react-toastify';

export const useMeetingData = (initial = []) => {
    const dispatch = useDispatch();
    const [data, setData] = useState(initial);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await dispatch(fetchMeetingData());
        if (result.payload.status === 200) {
          setData(result.payload.data?.data);
        } else {
          throw new Error('Failed to fetch meeting data');
        }
      } catch (err) {
        setError(err.message);
        toast.error(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
  
    return { data, loading, error, fetchData };
  };