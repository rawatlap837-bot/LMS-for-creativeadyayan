import { collection, getDocs } from "firebase/firestore";
import { db } from "./../firebase/Firebase";
import { useEffect, useState } from "react";

const CourseCard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllCourses() {
      try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,       // document ID bhi mil jaata hai
          ...doc.data(),    // baaki saare fields
        }));
        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllCourses();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-3 gap-4">
      <h1>Short Courses</h1>
      {courses.map((item, index) => {
        if (item.type === "long") {
          return (
            <div key={index} style={{ background: item.color }}>
              <h1>{item.title}</h1>
            </div>
          );
        }
        return null; // agar type "short" nahi hai to kuch render mat karo
      })}
    </div>
  );
};

export default CourseCard;