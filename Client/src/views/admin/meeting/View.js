import { Box, Button, Flex, Grid, GridItem, Heading, Text } from "@chakra-ui/react";
import Card from "components/card/Card";
import { HSeparator } from "components/separator/Separator";
import Spinner from "components/spinner/Spinner";
import moment from "moment";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useNavigate, useParams } from "react-router-dom";
import { HasAccess } from "../../../redux/accessUtils";
import { getApi, deleteApi } from "services/api";
import { DeleteIcon } from "@chakra-ui/icons";
import CommonDeleteModel from "components/commonDeleteModel";
import { FaFilePdf } from "react-icons/fa";
import html2pdf from "html2pdf.js";

const View = () => {
  const params = useParams();
  const [data, setData] = useState();
  const [deleteMany, setDeleteMany] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [permission, contactAccess, leadAccess] = HasAccess(["Meetings", "Contacts", "Leads"]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await getApi("api/meeting/", params.id);
      setData(response?.data?.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generatePDF = () => {
    setLoading(true);
    const element = document.getElementById("reports");
    const hideBtn = document.getElementById("hide-btn");
    if (element) {
      hideBtn.style.display = "none";
      html2pdf()
        .from(element)
        .set({
          margin: 0,
          filename: `Meeting_Details_${moment().format("DD-MM-YYYY")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .save()
        .then(() => {
          setLoading(false);
          hideBtn.style.display = "";
        });
    } else {
      console.error("Element with ID 'reports' not found.");
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async () => {
    setIsLoading(true);
    try {
      const response = await deleteApi("api/meeting/", params.id);
      if (response.status === 200) {
        setDeleteMany(false);
        navigate(-1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <Flex justifyContent="center" alignItems="center" w="100%">
          <Spinner />
        </Flex>
      ) : (
        <>
          <Grid templateColumns="repeat(4, 1fr)" gap={3} id="reports">
            <GridItem colSpan={{ base: 4 }}>
              <Heading size="lg" m={3}>
                {data?.agenda || ""}
              </Heading>
            </GridItem>

            <GridItem colSpan={{ base: 4 }}>
              <Card>
                <Grid gap={4}>
                  <GridItem colSpan={2}>
                    <Flex justifyContent="space-between">
                      <Heading size="md" mb={3}>
                        Meeting Details
                      </Heading>
                      <Box id="hide-btn">
                        <Button
                          leftIcon={<FaFilePdf />}
                          size="sm"
                          variant="brand"
                          onClick={generatePDF}
                          disabled={loading}
                        >
                          {loading ? "Please Wait..." : "Print as PDF"}
                        </Button>
                        <Button
                          leftIcon={<IoIosArrowBack />}
                          size="sm"
                          variant="brand"
                          onClick={() => navigate(-1)}
                          ml={2}
                        >
                          Back
                        </Button>
                      </Box>
                    </Flex>
                    <HSeparator />
                  </GridItem>

                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text fontWeight="bold">Agenda</Text>
                    <Text>{data?.agenda || " - "}</Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text fontWeight="bold">Created By</Text>
                    <Text>{data?.createdByName || " - "}</Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text fontWeight="bold">DateTime</Text>
                    <Text>
                      {data?.dateTime
                        ? `${moment(data.dateTime).format("DD-MM-YYYY h:mma")} [${moment(data.dateTime).toNow()}]`
                        : " - "}
                    </Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text fontWeight="bold">Timestamp</Text>
                    <Text>
                      {data?.timestamp
                        ? `${moment(data.timestamp).format("DD-MM-YYYY h:mma")} [${moment(data.timestamp).toNow()}]`
                        : " - "}
                    </Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text fontWeight="bold">Location</Text>
                    <Text>{data?.location || " - "}</Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text fontWeight="bold">Notes</Text>
                    <Text>{data?.notes || " - "}</Text>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <Text fontWeight="bold">Attendees</Text>
                    {data?.related === "Contact" && contactAccess?.view
                      ? data.attendes?.map((item) => (
                          <Link key={item._id} to={`/contactView/${item._id}`}>
                            <Text color="brand.600" _hover={{ color: "blue.500", textDecoration: "underline" }}>
                              {item.firstName + " " + item.lastName}
                            </Text>
                          </Link>
                        ))
                      : data?.related === "Lead" && leadAccess?.view
                      ? data.attendesLead?.map((item) => (
                          <Link key={item._id} to={`/leadView/${item._id}`}>
                            <Text color="brand.600" _hover={{ color: "blue.500", textDecoration: "underline" }}>
                              {item.leadName}
                            </Text>
                          </Link>
                        ))
                      : data?.related === "contact"
                      ? data.attendes?.map((item) => <Text key={item._id}>{item.firstName + " " + item.lastName}</Text>)
                      : data?.related === "lead"
                      ? data.attendesLead?.map((item) => <Text key={item._id}>{item.leadName}</Text>)
                      : "-"}
                  </GridItem>
                </Grid>
              </Card>
            </GridItem>
          </Grid>

          {(user.role === "superAdmin" || permission?.update || permission?.delete) && (
            <Card mt={3}>
              <Grid templateColumns="repeat(6, 1fr)" gap={1}>
                <GridItem colStart={6}>
                  <Flex justify="flex-end">
                    {(user.role === "superAdmin" || permission?.delete) && (
                      <Button
                        size="sm"
                        colorScheme="red"
                        leftIcon={<DeleteIcon />}
                        onClick={() => setDeleteMany(true)}
                      >
                        Delete
                      </Button>
                    )}
                  </Flex>
                </GridItem>
              </Grid>
            </Card>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <CommonDeleteModel
        isOpen={deleteMany}
        onClose={() => setDeleteMany(false)}
        type="Meetings"
        handleDeleteData={handleDeleteMeeting}
        ids={params.id}
      />
    </>
  );
};

export default View;
