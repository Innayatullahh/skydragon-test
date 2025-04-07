import { useEffect, useState } from 'react';
import { DeleteIcon, ViewIcon, SearchIcon } from '@chakra-ui/icons';
import {
  Button, Menu, MenuButton, MenuItem, MenuList, Text, useDisclosure, Spinner, Box
} from '@chakra-ui/react';
import { HasAccess } from '../../../redux/accessUtils';
import CommonCheckTable from '../../../components/reactTable/checktable';
import { CiMenuKebab } from 'react-icons/ci';
import { Link, useNavigate } from 'react-router-dom';
import MeetingAdvanceSearch from './components/MeetingAdvanceSearch';
import AddMeeting from './components/Addmeeting';
import CommonDeleteModel from 'components/commonDeleteModel';
import { deleteManyApi } from 'services/api';
import { toast } from 'react-toastify';
import { fetchMeetingData } from '../../../redux/slices/meetingSlice';
import { useDispatch } from 'react-redux';
import { useMeetingData } from 'hooks/meeting';

// ✅ Custom Hook for managing meeting data


const Index = () => {
  const title = 'Meeting';
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [action, setAction] = useState(false);
  const [selectedValues, setSelectedValues] = useState([]);
  const [advanceSearch, setAdvanceSearch] = useState(false);
  const [getTagValuesOutSide, setGetTagValuesOutside] = useState([]);
  const [searchboxOutside, setSearchboxOutside] = useState('');
  const [deleteMany, setDeleteMany] = useState(false);
  const [displaySearchData, setDisplaySearchData] = useState(false);
  const [searchedData, setSearchedData] = useState([]);
  const [permission] = HasAccess(['Meetings']);

  const { data, loading, error, fetchData } = useMeetingData();

  const handleDeleteMeeting = async (ids) => {
    try {
      setDeleteMany(false);
      const response = await deleteManyApi('api/meeting/batch-delete', ids);
      if (response.status === 200) {
        toast.success('Meeting(s) deleted successfully');
        setSelectedValues([]);
        setAction(prev => !prev); // Trigger data refresh
      } else {
        throw new Error('Failed to delete meeting(s)');
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting meeting(s)');
    }
  };

  useEffect(() => {
    fetchData();
  }, [action]);

  const actionHeader = {
    Header: 'Action', isSortable: false, center: true,
    cell: ({ row }) => (
      <Text fontSize="md" fontWeight="900" textAlign="center">
        <Menu isLazy>
          <MenuButton><CiMenuKebab /></MenuButton>
          <MenuList minW="fit-content">
            {permission?.view && (
              <MenuItem py={2.5} color="green" onClick={() => navigate(`/metting/${row?.values._id}`)} icon={<ViewIcon fontSize={15} />}>
                View
              </MenuItem>
            )}
            {permission?.delete && (
              <MenuItem py={2.5} color="red" onClick={() => { setDeleteMany(true); setSelectedValues([row?.values?._id]); }} icon={<DeleteIcon fontSize={15} />}>
                Delete
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      </Text>
    )
  };

  const tableColumns = [
    { Header: '#', accessor: '_id', isSortable: false, width: 10 },
    {
      Header: 'Agenda',
      accessor: 'agenda',
      cell: (cell) => (
        <Link to={`/metting/${cell?.row?.values._id}`}>
          <Text
            me="10px"
            sx={{ '&:hover': { color: 'blue.500', textDecoration: 'underline' } }}
            color="brand.600"
            fontSize="sm"
            fontWeight="700"
          >
            {cell?.value || ' - '}
          </Text>
        </Link>
      )
    },
    { Header: 'Date & Time', accessor: 'dateTime' },
    { Header: 'Time Stamp', accessor: 'timestamp' },
    { Header: 'Create By', accessor: 'createdByName' },
    ...(permission?.update || permission?.view || permission?.delete ? [actionHeader] : [])
  ];

  return (
    <div>
      {loading && (
        <Box textAlign="center" py={4}>
          <Spinner size="xl" />
          <Text mt={2}>Loading Meetings...</Text>
        </Box>
      )}

      {!loading && !error && (
        <CommonCheckTable
          title={title}
          isLoding={loading}
          columnData={tableColumns}
          allData={data}
          tableData={data}
          searchDisplay={displaySearchData}
          setSearchDisplay={setDisplaySearchData}
          searchedDataOut={searchedData}
          setSearchedDataOut={setSearchedData}
          tableCustomFields={[]}
          access={permission}
          onOpen={onOpen}
          selectedValues={selectedValues}
          setSelectedValues={setSelectedValues}
          setDelete={setDeleteMany}
          AdvanceSearch={
            <Button
              variant="outline"
              colorScheme="brand"
              leftIcon={<SearchIcon />}
              mt={{ sm: '5px', md: '0' }}
              size="sm"
              onClick={() => setAdvanceSearch(true)}
            >
              Advance Search
            </Button>
          }
          getTagValuesOutSide={getTagValuesOutSide}
          searchboxOutside={searchboxOutside}
          setGetTagValuesOutside={setGetTagValuesOutside}
          setSearchboxOutside={setSearchboxOutside}
          handleSearchType="MeetingSearch"
        />
      )}

      <MeetingAdvanceSearch
        advanceSearch={advanceSearch}
        setAdvanceSearch={setAdvanceSearch}
        setSearchedData={setSearchedData}
        setDisplaySearchData={setDisplaySearchData}
        allData={data}
        setAction={setAction}
        setGetTagValues={setGetTagValuesOutside}
        setSearchbox={setSearchboxOutside}
      />

      <AddMeeting
        fetchData={fetchData}
        setAction={setAction}
        isOpen={isOpen}
        onClose={onClose}
      />

      <CommonDeleteModel
        isOpen={deleteMany}
        onClose={() => setDeleteMany(false)}
        type="Meetings"
        handleDeleteData={handleDeleteMeeting}
        ids={selectedValues}
      />
    </div>
  );
};

export default Index;
