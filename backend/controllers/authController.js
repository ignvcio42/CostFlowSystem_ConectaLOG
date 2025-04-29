export const signupUser = async (req, res) => {
    try {
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const signinUser = async (req, res) => {
    try {
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ status: "error", message: error.message });
    }
};

