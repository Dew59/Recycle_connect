import Recycler from '../models/recyclerModel.js';

export const getActiveRecyclersService = async () => {
    const recyclers = await Recycler.find({
        isActive: true
    })
        .select(
            'businessName email phone businessAddress profilePhoto route'
        )
        .sort({ businessName: 1 });

    return recyclers;
};