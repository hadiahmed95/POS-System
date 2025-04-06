import { BASE_URL } from "@/config/constants";

const Categories = {
    getCategories: async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/categories/view`, {
            method: "POST"
            }).then(async response => response.json())

            return res.data
        }
        catch (error) {
            console.error("Error fetching data:", error);
            return error
        }
    }
}

export default Categories