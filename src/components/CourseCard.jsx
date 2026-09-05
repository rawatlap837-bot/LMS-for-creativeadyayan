import { collection, getDocs } from "firebase/firestore";
import { db } from "./../firebase/Firebase";
import { useEffect, useState } from "react";
import { CourseCardSkeleton } from "./Skeleton"; // adjust path if Skeleton.jsx lives elsewhere

const CourseCard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllCourses() {
      try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
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

  return (
    <div className="grid grid-cols-3 gap-4">
      <h1>Short Courses</h1>
      {loading
        ? Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)
        : courses.map((item, index) => {
          if (item.type === "long") {
            return (
              <div key={index} style={{ background: item.color }}>
                <h1>{item.title}</h1>
              </div>
            );
          }
          return null;
        })}
    </div>
  );
};

export default CourseCard;